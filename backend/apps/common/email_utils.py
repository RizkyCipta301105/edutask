"""
EduTask Email Utility — Brevo (Sendinblue) API
================================================
Mengirim email via Brevo REST API (https://api.brevo.com/v3/smtp/email).
Bekerja di Railway karena menggunakan HTTPS (port 443), bukan SMTP (port 587).

Konfigurasi di .env:
    BREVO_API_KEY=xkeysib-xxxx
    BREVO_FROM_EMAIL=noreply@domainmu.com   # harus domain terverifikasi di Brevo
    BREVO_FROM_NAME=EduTask                  # (opsional)
"""
import logging
import threading

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(subject: str, message: str, recipient_email: str, recipient_name: str = "") -> bool:
    """
    Kirim email via Brevo HTTP API.

    Returns True jika berhasil, False jika gagal.
    """
    api_key = getattr(settings, "BREVO_API_KEY", None)
    from_email = getattr(settings, "BREVO_FROM_EMAIL", "noreply@edutask.id")
    from_name = getattr(settings, "BREVO_FROM_NAME", "EduTask")

    if not api_key:
        logger.warning("BREVO_API_KEY tidak diset — email tidak dikirim.")
        return False

    payload = {
        "sender": {"name": from_name, "email": from_email},
        "to": [{"email": recipient_email, "name": recipient_name or recipient_email}],
        "subject": subject,
        "textContent": message,
    }

    try:
        resp = requests.post(
            BREVO_API_URL,
            json=payload,
            headers={
                "api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=10,
        )

        if resp.status_code in (200, 201):
            logger.info("Email terkirim ke %s (Brevo messageId: %s)", recipient_email, resp.json().get("messageId"))
            return True
        else:
            logger.error(
                "Brevo API error %s: %s — to=%s subject=%s",
                resp.status_code,
                resp.text,
                recipient_email,
                subject,
            )
            return False

    except requests.RequestException as exc:
        logger.error("Brevo request gagal: %s", exc)
        return False


class EmailThread(threading.Thread):
    """Kirim email di background thread agar tidak memblokir response."""

    def __init__(self, subject: str, message: str, recipient_email: str, recipient_name: str = ""):
        super().__init__(daemon=True)
        self.subject = subject
        self.message = message
        self.recipient_email = recipient_email
        self.recipient_name = recipient_name

    def run(self):
        send_email(self.subject, self.message, self.recipient_email, self.recipient_name)
