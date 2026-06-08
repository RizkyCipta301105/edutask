import hmac
import hashlib
import uuid
import json
import logging
import requests
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.common.utils import success_response, error_response
from .models import Subscription, PaymentProof
from .serializers import SubscriptionSerializer, PaymentProofSerializer

logger = logging.getLogger(__name__)

PLANS = {
    'pro':  {'name': 'EduTask Pro',  'price': 4999},
    'team': {'name': 'EduTask Team', 'price': 9999},
}

# ─── KlikQRIS Helpers ─────────────────────────────────────────────────────────
# Baca dari settings (di-load dari .env via django-decouple) — tidak hardcoded

KLIKQRIS_BASE_URL = 'https://klikqris.com/api'
KLIKQRIS_API_KEY  = getattr(settings, 'KLIKQRIS_API_KEY',  '')
KLIKQRIS_MERCHANT = getattr(settings, 'KLIKQRIS_MERCHANT', '')


def _klikqris_headers():
    return {
        'Content-Type': 'application/json',
        'x-api-key': KLIKQRIS_API_KEY,
        'id_merchant': KLIKQRIS_MERCHANT,
    }


def _klikqris_create(order_id: str, amount: int, keterangan: str = '') -> dict:
    """Buat transaksi QRIS baru di KlikQRIS."""
    payload = {
        'order_id':    order_id,
        'id_merchant': KLIKQRIS_MERCHANT,
        'amount':      amount,
        'keterangan':  keterangan,
    }
    try:
        resp = requests.post(
            f'{KLIKQRIS_BASE_URL}/qris/create',
            json=payload,
            headers=_klikqris_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        raise RuntimeError('Tidak dapat terhubung ke KlikQRIS.')
    except requests.exceptions.Timeout:
        raise RuntimeError('KlikQRIS tidak merespons (timeout).')
    except requests.exceptions.HTTPError as e:
        detail = ''
        try:
            detail = e.response.json().get('message', '')
        except Exception:
            pass
        raise RuntimeError(f'KlikQRIS error: {detail or str(e)}')


def _klikqris_check(order_id: str) -> dict:
    """Cek status transaksi di KlikQRIS."""
    try:
        resp = requests.get(
            f'{KLIKQRIS_BASE_URL}/qris/status/{order_id}',
            headers=_klikqris_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        raise RuntimeError('Tidak dapat terhubung ke KlikQRIS.')
    except requests.exceptions.Timeout:
        raise RuntimeError('KlikQRIS tidak merespons (timeout).')
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f'KlikQRIS error: {str(e)}')


def get_or_create_subscription(user):
    sub, _ = Subscription.objects.get_or_create(
        user=user,
        defaults={'plan': Subscription.Plan.FREE, 'status': Subscription.Status.ACTIVE}
    )
    return sub


# ─── Views ────────────────────────────────────────────────────────────────────

class MySubscriptionView(APIView):
    """GET /api/payment/subscription/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = get_or_create_subscription(request.user)
        return success_response(
            data=SubscriptionSerializer(sub).data,
            message='Data subscription berhasil diambil.'
        )


class CreateInvoiceView(APIView):
    """
    POST /api/payment/create-invoice/
    Buat transaksi QRIS di KlikQRIS dan kembalikan data QR ke frontend.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_key = request.data.get('plan', '').lower()
        if plan_key not in PLANS:
            return error_response(message='Paket tidak valid.')

        plan = PLANS[plan_key]
        user = request.user

        if not user.is_email_verified:
            return error_response(message='Verifikasi email Anda terlebih dahulu sebelum berlangganan.')

        # Cek apakah sudah ada invoice pending untuk plan ini
        existing = PaymentProof.objects.filter(
            user=user,
            plan=plan_key,
            status=PaymentProof.Status.PENDING,
            order_id__startswith='EDUTASK-',
        ).first()
        if existing and existing.order_id:
            # Coba ambil ulang data QRIS dari KlikQRIS
            try:
                kq_data = _klikqris_check(existing.order_id)
                tx = kq_data.get('data', {})
                kq_status = tx.get('status', 'PENDING').upper()
                if kq_status == 'PENDING':
                    # amount = harga asli plan, total_amount = harga + kode unik dari KlikQRIS
                    kq_total = tx.get('total_amount')
                    plan_price = plan['price']
                    total_amt = int(float(kq_total)) if kq_total else existing.amount
                    return success_response(
                        data={
                            'order_id':    existing.order_id,
                            'amount':      plan_price,
                            'total_amount': total_amt,
                            'qris_url':    tx.get('qris_url', ''),
                            'qris_image':  tx.get('qris_image', ''),
                            'expired_at':  tx.get('expired_at', ''),
                            'signature':   tx.get('signature', ''),
                            'plan':        plan_key,
                            'status':      'PENDING',
                        },
                        message='Invoice masih aktif. Silakan selesaikan pembayaran.'
                    )
                # Jika sudah tidak pending, hapus agar buat baru
                existing.delete()
            except RuntimeError:
                pass  # fallthrough ke buat baru

        # Generate order_id unik
        short_id = uuid.uuid4().hex[:8].upper()
        order_id = f"EDUTASK-{short_id}"

        try:
            result = _klikqris_create(
                order_id=order_id,
                amount=plan['price'],
                keterangan=f"EduTask {plan['name']} — {user.email}",
            )
        except RuntimeError as e:
            return error_response(message=str(e))

        if not result.get('status'):
            return error_response(message=result.get('message', 'Gagal membuat transaksi QRIS.'))

        tx = result.get('data', {})
        total_amount = int(float(tx.get('total_amount', plan['price'])))

        # Simpan PaymentProof pending — amount = harga asli plan (tanpa kode unik)
        PaymentProof.objects.create(
            user=user,
            plan=plan_key,
            amount=plan['price'],
            order_id=order_id,
        )

        return success_response(
            data={
                'order_id':    order_id,
                'amount':      plan['price'],
                'total_amount': total_amount,
                'qris_url':    tx.get('qris_url', ''),
                'qris_image':  tx.get('qris_image', ''),
                'expired_at':  tx.get('expired_at', ''),
                'signature':   tx.get('signature', ''),
                'plan':        plan_key,
                'status':      'PENDING',
            },
            message='Transaksi QRIS berhasil dibuat. Silakan scan QR Code.'
        )


class CheckInvoiceView(APIView):
    """
    GET /api/payment/check-invoice/?order_id=EDUTASK-XXXX
    Cek status transaksi di KlikQRIS secara real-time.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_id = request.query_params.get('order_id', '')
        if not order_id:
            return error_response(message='order_id wajib diisi.')

        # Pastikan order milik user ini
        proof = PaymentProof.objects.filter(
            user=request.user,
            order_id=order_id
        ).first()
        if not proof:
            return error_response(message='Transaksi tidak ditemukan.')

        try:
            result = _klikqris_check(order_id)
        except RuntimeError as e:
            return error_response(message=str(e))

        tx = result.get('data', {})
        kq_status = tx.get('status', 'PENDING').upper()

        # Map KlikQRIS status → internal
        status_map = {'SUCCESS': 'paid', 'PENDING': 'pending', 'EXPIRED': 'expired'}
        internal_status = status_map.get(kq_status, 'pending')

        # Jika baru saja dibayar dan belum diproses, aktifkan subscription
        if kq_status == 'SUCCESS' and proof.status != PaymentProof.Status.APPROVED:
            proof.status = PaymentProof.Status.APPROVED
            proof.reviewed_at = timezone.now()
            proof.save()

            plan_map = {'pro': Subscription.Plan.PRO, 'team': Subscription.Plan.TEAM}
            sub = get_or_create_subscription(proof.user)
            sub.plan = plan_map.get(proof.plan, Subscription.Plan.PRO)
            sub.status = Subscription.Status.ACTIVE
            sub.start_date = timezone.now()
            sub.end_date = timezone.now() + timedelta(days=30)
            sub.order_id = order_id
            sub.save()

        return success_response(
            data={
                'order_id':     order_id,
                'status':       internal_status,
                'amount':       tx.get('amount'),
                'total_amount': tx.get('total_amount'),
                'paid_at':      tx.get('paid_at'),
                'expired_at':   tx.get('expired_at'),
                'plan':         proof.plan,
            },
            message='Status transaksi berhasil diambil.'
        )


class PaymentWebhookView(APIView):
    """
    POST /api/payment/webhook/
    Menerima notifikasi dari KlikQRIS saat status transaksi berubah.
    Validasi signature lalu aktifkan subscription.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, Exception):
            return error_response(message='Invalid JSON payload.')

        order_id  = body.get('order_id', '')
        status    = body.get('status', '').upper()
        signature = body.get('signature', '')

        # Validasi signature: bandingkan dengan signature saat create
        proof = PaymentProof.objects.filter(order_id=order_id).first()
        if not proof:
            # order_id tidak dikenal, kembalikan 200 agar KlikQRIS tidak retry
            return success_response(message='Order tidak ditemukan, diabaikan.')

        # Hanya proses status PAID/SUCCESS
        if status not in ('PAID', 'SUCCESS'):
            return success_response(message='Status diabaikan.')

        if proof.status == PaymentProof.Status.APPROVED:
            return success_response(message='Sudah diproses sebelumnya.')

        # Verifikasi status ke KlikQRIS — WAJIB berhasil, tidak ada fallback
        try:
            result = _klikqris_check(order_id)
            tx = result.get('data', {})
            kq_status = tx.get('status', '').upper()

            # Validasi signature jika tersedia
            expected_sig = tx.get('signature', '')
            if expected_sig and signature and signature != expected_sig:
                return error_response(message='Signature tidak valid.')

            if kq_status not in ('SUCCESS', 'PAID'):
                return success_response(message='Status belum lunas, tidak diproses.')

        except RuntimeError as e:
            # Jika tidak bisa reach KlikQRIS, tolak — jangan aktifkan tanpa konfirmasi
            logger.error(f'[Webhook] Gagal verifikasi ke KlikQRIS untuk {order_id}: {e}')
            return error_response(
                message='Tidak dapat memverifikasi pembayaran ke KlikQRIS.',
                status_code=503,
            )

        # Aktifkan subscription
        proof.status = PaymentProof.Status.APPROVED
        proof.reviewed_at = timezone.now()
        proof.save()

        plan_map = {'pro': Subscription.Plan.PRO, 'team': Subscription.Plan.TEAM}
        sub = get_or_create_subscription(proof.user)
        sub.plan = plan_map.get(proof.plan, Subscription.Plan.PRO)
        sub.status = Subscription.Status.ACTIVE
        sub.start_date = timezone.now()
        sub.end_date = timezone.now() + timedelta(days=30)
        sub.order_id = order_id
        sub.save()

        return success_response(
            message=f'Subscription {proof.plan} diaktifkan untuk {proof.user.email}.'
        )


class SubmitProofView(APIView):
    """
    POST /api/payment/submit-proof/
    Fallback: upload bukti transfer manual (jika Bayarin tidak tersedia).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_key = request.data.get('plan', '').lower()
        proof_file = request.FILES.get('proof')

        if plan_key not in PLANS:
            return error_response(message='Paket tidak valid.')
        if not proof_file:
            return error_response(message='Bukti pembayaran wajib diupload.')

        if not request.user.is_email_verified:
            return error_response(message='Anda harus memverifikasi email Anda terlebih dahulu sebelum berlangganan paket berbayar.')

        if proof_file.size > 5 * 1024 * 1024:
            return error_response(message='Ukuran file maksimal 5MB.')

        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if proof_file.content_type not in allowed_types:
            return error_response(message='Format file harus JPG, PNG, atau WEBP.')

        existing_pending = PaymentProof.objects.filter(
            user=request.user,
            plan=plan_key,
            status=PaymentProof.Status.PENDING
        ).exists()
        if existing_pending:
            return error_response(
                message='Anda sudah memiliki pengajuan yang sedang diverifikasi untuk paket ini.'
            )

        proof = PaymentProof.objects.create(
            user=request.user,
            plan=plan_key,
            proof_image=proof_file,
            amount=PLANS[plan_key]['price'],
        )

        return success_response(
            data={'id': str(proof.id), 'status': proof.status},
            message='Bukti pembayaran berhasil dikirim. Admin akan memverifikasi dalam 1×24 jam.'
        )


class MyPaymentProofsView(APIView):
    """GET /api/payment/proofs/ — riwayat pengajuan milik user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        proofs = PaymentProof.objects.filter(user=request.user).order_by('-created_at')
        return success_response(
            data=PaymentProofSerializer(proofs, many=True, context={'request': request}).data,
            message='Riwayat pembayaran berhasil diambil.'
        )
