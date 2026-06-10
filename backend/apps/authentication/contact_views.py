"""
Contact form endpoint — mengirim email ke edutask.noreply@gmail.com
"""
import logging

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from apps.common.utils import success_response, error_response
from apps.common.email_utils import EmailThread

logger = logging.getLogger(__name__)

TOPIC_CHOICES = {
    'General Inquiry',
    'Technical Support',
    'Billing & Payments',
    'Partnership',
}


class ContactFormRateThrottle(AnonRateThrottle):
    rate = '5/hour'


class ContactFormView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ContactFormRateThrottle]

    def post(self, request):
        data = request.data

        name    = str(data.get('name', '')).strip()
        email   = str(data.get('email', '')).strip()
        topic   = str(data.get('topic', '')).strip()
        subject = str(data.get('subject', '')).strip()
        message = str(data.get('message', '')).strip()

        # Validasi
        if not all([name, email, subject, message]):
            return error_response(message='Nama, email, subjek, dan pesan wajib diisi.')

        if '@' not in email or '.' not in email.split('@')[-1]:
            return error_response(message='Format email tidak valid.')

        if len(message) < 10:
            return error_response(message='Pesan terlalu pendek.')

        if len(message) > 5000:
            return error_response(message='Pesan terlalu panjang (maks. 5000 karakter).')

        if topic and topic not in TOPIC_CHOICES:
            return error_response(message='Topik tidak valid.')

        # Badan email yang masuk ke inbox EduTask
        body = (
            f"Ada pesan baru dari form kontak EduTask.\n"
            f"{'=' * 50}\n\n"
            f"Nama    : {name}\n"
            f"Email   : {email}\n"
            f"Topik   : {topic or '(tidak dipilih)'}\n"
            f"Subjek  : {subject}\n\n"
            f"Pesan:\n{message}\n\n"
            f"{'=' * 50}\n"
            f"Balas langsung ke: {email}"
        )

        EmailThread(
            subject=f'[EduTask Contact] {subject}',
            message=body,
            recipient_email='edutask.noreply@gmail.com',
            recipient_name='EduTask Team',
        ).start()

        # Email konfirmasi ke pengirim
        confirm_body = (
            f"Halo {name},\n\n"
            f"Terima kasih sudah menghubungi EduTask!\n\n"
            f"Kami sudah menerima pesanmu dengan subjek:\n"
            f'"{subject}"\n\n'
            f"Tim kami akan membalas ke {email} dalam 1x24 jam kerja.\n\n"
            f"— Tim EduTask"
        )

        EmailThread(
            subject='EduTask — Pesan kamu sudah kami terima',
            message=confirm_body,
            recipient_email=email,
            recipient_name=name,
        ).start()

        return success_response(message='Pesan berhasil dikirim. Cek inbox email kamu untuk konfirmasi.')
