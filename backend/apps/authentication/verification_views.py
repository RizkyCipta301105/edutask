from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.conf import settings
from apps.common.permissions import PasswordResetRateThrottle
import threading
import logging
import requests

logger = logging.getLogger(__name__)


def _send_email(subject, message, recipient_email, recipient_name=""):
    """Kirim email via Resend HTTP API (tidak pakai SMTP)."""
    api_key = getattr(settings, 'RESEND_API_KEY', None)

    if not api_key:
        logger.error("RESEND_API_KEY tidak dikonfigurasi.")
        return

    url = "https://api.resend.com/emails"
    payload = {
        "from": f"EduTask <{settings.EMAIL_HOST_USER}>",
        "to": [recipient_email],
        "subject": subject,
        "text": message,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code not in (200, 201):
            logger.error(f"Resend API error {resp.status_code}: {resp.text}")
        else:
            logger.info(f"Email sent via Resend to {recipient_email}")
    except Exception as e:
        logger.error(f"Email failed to send: {e}")


class EmailThread(threading.Thread):
    def __init__(self, subject, message, recipient_email, recipient_name=""):
        self.subject = subject
        self.message = message
        self.recipient_email = recipient_email
        self.recipient_name = recipient_name
        threading.Thread.__init__(self)

    def run(self):
        _send_email(self.subject, self.message, self.recipient_email, self.recipient_name)
from .models import VerificationToken, User
from apps.common.utils import success_response, error_response

class SendVerificationEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return error_response(message="Email sudah terverifikasi.")

        # Hapus token lama
        VerificationToken.objects.filter(user=user, token_type=VerificationToken.TokenType.EMAIL).delete()

        # Buat token baru (berlaku 1 hari)
        token = VerificationToken.objects.create(
            user=user,
            token_type=VerificationToken.TokenType.EMAIL,
            expires_at=timezone.now() + timezone.timedelta(days=1)
        )

        verify_url = f"{getattr(settings, 'EDUTASK_FRONTEND_URL', 'http://localhost:5173')}/verify-email?token={token.token}"
        
        EmailThread(
            subject="Verifikasi Email EduTask",
            message=f"Halo {user.nama_lengkap},\n\nKlik link berikut untuk memverifikasi alamat email Anda:\n{verify_url}\n\nLink ini berlaku selama 24 jam.",
            recipient_email=user.email,
            recipient_name=user.nama_lengkap,
        ).start()

        return success_response(message="Email verifikasi telah dikirim. Silakan cek kotak masuk Anda.")


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('token')
        if not token_str:
            return error_response(message="Token tidak diberikan.")

        try:
            token = VerificationToken.objects.get(token=token_str, token_type=VerificationToken.TokenType.EMAIL)
        except VerificationToken.DoesNotExist:
            return error_response(message="Token verifikasi tidak valid atau tidak ditemukan.", code=status.HTTP_404_NOT_FOUND)

        if not token.is_valid:
            return error_response(message="Token verifikasi sudah kadaluarsa.")

        user = token.user
        user.is_email_verified = True
        user.save()

        # Hapus token setelah digunakan
        token.delete()

        return success_response(message="Email berhasil diverifikasi.")


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return error_response(message="Email wajib diisi.")

        user = User.objects.filter(email=email).first()
        if not user:
            # Tetap response sukses untuk security (mencegah enumerasi email)
            return success_response(message="Jika email terdaftar, instruksi reset password telah dikirim.")

        # Hapus token lama
        VerificationToken.objects.filter(user=user, token_type=VerificationToken.TokenType.PASSWORD).delete()

        # Buat token baru (berlaku 1 jam)
        token = VerificationToken.objects.create(
            user=user,
            token_type=VerificationToken.TokenType.PASSWORD,
            expires_at=timezone.now() + timezone.timedelta(hours=1)
        )

        reset_url = f"{getattr(settings, 'EDUTASK_FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={token.token}"
        
        EmailThread(
            subject="Reset Password EduTask",
            message=f"Halo {user.nama_lengkap},\n\nAnda meminta reset password. Klik link berikut untuk membuat password baru:\n{reset_url}\n\nLink ini berlaku selama 1 jam.",
            recipient_email=user.email,
            recipient_name=user.nama_lengkap,
        ).start()

        return success_response(message="Jika email terdaftar, instruksi reset password telah dikirim.")


class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('token')
        new_password = request.data.get('new_password')

        if not token_str or not new_password:
            return error_response(message="Token dan password baru wajib diisi.")

        try:
            token = VerificationToken.objects.get(token=token_str, token_type=VerificationToken.TokenType.PASSWORD)
        except VerificationToken.DoesNotExist:
            return error_response(message="Token reset password tidak valid.", code=status.HTTP_404_NOT_FOUND)

        if not token.is_valid:
            return error_response(message="Token reset password sudah kadaluarsa.")

        if len(new_password) < 8:
            return error_response(message="Password harus minimal 8 karakter.")

        user = token.user
        user.set_password(new_password)
        user.save()

        # Hapus token
        token.delete()

        return success_response(message="Password berhasil direset. Silakan login dengan password baru Anda.")
