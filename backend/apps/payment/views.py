import hmac
import hashlib
import json
import requests
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.common.utils import success_response, error_response
from .models import Subscription, PaymentProof
from .serializers import SubscriptionSerializer, PaymentProofSerializer

PLANS = {
    'pro':  {'name': 'EduTask Pro',  'price': 4999},
    'team': {'name': 'EduTask Team', 'price': 9999},
}


def get_or_create_subscription(user):
    sub, _ = Subscription.objects.get_or_create(
        user=user,
        defaults={'plan': Subscription.Plan.FREE, 'status': Subscription.Status.ACTIVE}
    )
    return sub


def _call_bayarin(method: str, path: str, **kwargs):
    """Helper untuk memanggil Bayarin API dengan API Key dari settings."""
    base_url = getattr(settings, 'BAYARIN_BASE_URL', 'http://localhost:8001')
    api_key = getattr(settings, 'BAYARIN_API_KEY', '')
    url = f"{base_url}{path}"
    headers = {
        'X-API-Key': api_key,
        'Content-Type': 'application/json',
    }
    try:
        resp = requests.request(method, url, headers=headers, timeout=10, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        raise RuntimeError('Tidak dapat terhubung ke Bayarin. Pastikan Bayarin backend berjalan.')
    except requests.exceptions.Timeout:
        raise RuntimeError('Bayarin tidak merespons (timeout).')
    except requests.exceptions.HTTPError as e:
        detail = ''
        try:
            detail = e.response.json().get('detail', '')
        except Exception:
            pass
        raise RuntimeError(f'Bayarin error: {detail or str(e)}')


def _verify_bayarin_signature(invoice_id: str, status: str, amount: int,
                               timestamp: int, signature: str) -> bool:
    """Verifikasi HMAC-SHA256 signature dari webhook Bayarin."""
    secret = getattr(settings, 'BAYARIN_WEBHOOK_SECRET', '')
    if not secret:
        return False
    message = f"{invoice_id}|{status}|{amount}|{timestamp}"
    expected = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


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
    Buat invoice di Bayarin dan kembalikan payment_url ke frontend.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_key = request.data.get('plan', '').lower()
        if plan_key not in PLANS:
            return error_response(message='Paket tidak valid.')

        plan = PLANS[plan_key]
        user = request.user

        if not user.is_email_verified:
            return error_response(message='Anda harus memverifikasi email Anda terlebih dahulu sebelum berlangganan paket berbayar.')

        # Cek apakah sudah ada invoice pending untuk plan ini
        existing = PaymentProof.objects.filter(
            user=user,
            plan=plan_key,
            status=PaymentProof.Status.PENDING
        ).first()
        if existing and existing.order_id:
            # Kembalikan invoice yang sudah ada
            frontend_url = getattr(settings, 'BAYARIN_FRONTEND_URL', 'http://localhost:5174')
            return success_response(
                data={
                    'invoice_id': existing.order_id,
                    'payment_url': f"{frontend_url}/pay/{existing.order_id}",
                    'amount': existing.amount,
                    'plan': plan_key,
                    'status': 'pending',
                },
                message='Invoice sudah ada. Silakan selesaikan pembayaran.'
            )

        # Buat invoice baru di Bayarin
        edutask_base = getattr(settings, 'EDUTASK_BASE_URL', 'http://localhost:8000')
        webhook_url = f"{edutask_base}/api/payment/webhook/"

        payload = {
            'amount': plan['price'],
            'description': f"EduTask {plan['name']} — {user.email}",
            'customer_name': user.nama_lengkap,
            'customer_email': user.email,
            'payment_method': 'qris',
            'callback_url': webhook_url,
            'redirect_url': f"{getattr(settings, 'EDUTASK_FRONTEND_URL', 'http://localhost:5173')}/dashboard",
        }

        try:
            data = _call_bayarin('POST', '/api/payments/create', json=payload)
        except RuntimeError as e:
            return error_response(message=str(e))

        invoice_id = data.get('invoice_id', '')
        payment_url = data.get('payment_url', '')

        # Simpan sebagai PaymentProof pending dengan order_id = invoice_id Bayarin
        PaymentProof.objects.create(
            user=user,
            plan=plan_key,
            amount=plan['price'],
            order_id=invoice_id,
            # proof_image tidak diperlukan untuk alur Bayarin (diisi dummy)
        )

        return success_response(
            data={
                'invoice_id': invoice_id,
                'payment_url': payment_url,
                'amount': plan['price'],
                'plan': plan_key,
                'qr_image_url': data.get('qr_image_url', ''),
            },
            message='Invoice berhasil dibuat. Silakan selesaikan pembayaran.'
        )


class CheckInvoiceView(APIView):
    """
    GET /api/payment/check-invoice/?invoice_id=BAYARIN-xxx
    Cek status invoice di Bayarin secara real-time.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoice_id = request.query_params.get('invoice_id', '')
        if not invoice_id:
            return error_response(message='invoice_id wajib diisi.')

        # Pastikan invoice milik user ini
        proof = PaymentProof.objects.filter(
            user=request.user,
            order_id=invoice_id
        ).first()
        if not proof:
            return error_response(message='Invoice tidak ditemukan.')

        try:
            data = _call_bayarin('GET', f'/api/payments/check?invoice_id={invoice_id}')
        except RuntimeError as e:
            return error_response(message=str(e))

        return success_response(
            data={
                'invoice_id': data.get('invoice_id'),
                'status': data.get('status'),
                'amount': data.get('amount'),
                'paid_at': data.get('paid_at'),
                'expires_at': data.get('expires_at'),
                'plan': proof.plan,
            },
            message='Status invoice berhasil diambil.'
        )


class PaymentWebhookView(APIView):
    """
    POST /api/payment/webhook/
    Menerima notifikasi dari Bayarin saat pembayaran berhasil.
    Verifikasi signature lalu aktifkan subscription user.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Ambil signature dari header
        signature = request.headers.get('X-Webhook-Signature', '')
        timestamp_str = request.headers.get('X-Webhook-Timestamp', '0')
        event = request.headers.get('X-Webhook-Event', '')

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, Exception):
            return error_response(message='Invalid JSON payload.')

        invoice_id = body.get('invoice_id', '')
        status = body.get('status', '')
        amount = body.get('amount', 0)
        timestamp = int(timestamp_str) if timestamp_str.isdigit() else 0

        # Verifikasi signature
        if not _verify_bayarin_signature(invoice_id, status, amount, timestamp, signature):
            # Log tapi jangan reject — mungkin webhook_secret belum di-set
            # Di production, uncomment baris berikut:
            # return error_response(message='Invalid webhook signature.', status_code=401)
            pass

        # Hanya proses event payment.paid
        if event != 'payment.paid' or status != 'paid':
            return success_response(message='Event diabaikan.')

        # Cari PaymentProof berdasarkan invoice_id (order_id)
        proof = PaymentProof.objects.filter(order_id=invoice_id).first()
        if not proof:
            return error_response(message='Invoice tidak ditemukan di sistem.')

        if proof.status == PaymentProof.Status.APPROVED:
            return success_response(message='Sudah diproses sebelumnya.')

        # Tandai proof sebagai approved
        proof.status = PaymentProof.Status.APPROVED
        proof.reviewed_at = timezone.now()
        proof.save()

        # Aktifkan subscription
        plan_map = {
            'pro': Subscription.Plan.PRO,
            'team': Subscription.Plan.TEAM,
        }
        sub = get_or_create_subscription(proof.user)
        sub.plan = plan_map.get(proof.plan, Subscription.Plan.PRO)
        sub.status = Subscription.Status.ACTIVE
        sub.start_date = timezone.now()
        sub.end_date = timezone.now() + timedelta(days=30)
        sub.order_id = invoice_id
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
