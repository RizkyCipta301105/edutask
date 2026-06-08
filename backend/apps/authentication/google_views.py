from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import logging

from .models import User
from .jwt_utils import build_auth_tokens
from apps.common.utils import success_response, error_response
from apps.common.permissions import GoogleLoginRateThrottle
from .views import build_auth_payload

logger = logging.getLogger(__name__)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [GoogleLoginRateThrottle]

    def post(self, request):
        token = request.data.get('id_token')
        role = request.data.get('role', User.Role.UMUM)

        if not token:
            return error_response(message="Token Google tidak ditemukan.")

        try:
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            if not client_id:
                return error_response(message="Google OAuth belum dikonfigurasi di server.")

            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                client_id,
                clock_skew_in_seconds=120,  # toleransi 2 menit untuk clock drift
            )

            if idinfo.get('iss') not in ('accounts.google.com', 'https://accounts.google.com'):
                raise ValueError('Invalid token issuer.')

            if idinfo.get('aud') != client_id:
                raise ValueError('Invalid token audience.')

            email = idinfo.get('email', '').lower()
            if not email:
                raise ValueError('Email tidak ditemukan dalam token Google.')

            if not idinfo.get('email_verified', False):
                return error_response(
                    message="Email Google belum diverifikasi.",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )

            nama_lengkap = idinfo.get('name', email.split('@')[0])

            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    email=email,
                    nama_lengkap=nama_lengkap,
                    tipe_akun=User.TipeAkun.GMAIL,
                    role=role,
                    is_email_verified=True,
                )

            return success_response(
                data=build_auth_payload(user, request),
                message="Berhasil masuk dengan Google.",
                status_code=status.HTTP_200_OK,
            )

        except ValueError as e:
            logger.warning(f"Google token verification failed: {e}")
            return error_response(
                message="Token Google tidak valid atau sudah kedaluwarsa.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            logger.error(f"Google login unexpected error: {type(e).__name__}: {e}")
            return error_response(
                message="Terjadi kesalahan saat verifikasi Google.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
