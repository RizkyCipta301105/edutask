from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import User
from .jwt_utils import build_auth_tokens
from apps.common.utils import success_response, error_response
from .views import build_auth_payload

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('id_token')
        role = request.data.get('role', User.Role.UMUM)

        if not token:
            return error_response(message="Token Google tidak ditemukan.")

        # Simulasi/Mock Mode untuk testing lokal
        if token.startswith('mock-google-token-'):
            email = token.replace('mock-google-token-', '')
            nama_lengkap = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    email=email,
                    nama_lengkap=nama_lengkap,
                    tipe_akun=User.TipeAkun.GMAIL,
                    role=role,
                    is_email_verified=True
                )
            
            return success_response(
                data=build_auth_payload(user, request),
                message="Berhasil masuk dengan Google (Simulasi).",
                status_code=status.HTTP_200_OK
            )

        try:
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            if not client_id:
                return error_response(message="Google OAuth belum dikonfigurasi di server.")

            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                client_id,
                clock_skew_in_seconds=120  # toleransi 2 menit clock skew
            )

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            email = idinfo['email']
            nama_lengkap = idinfo.get('name', '')

            user = User.objects.filter(email=email).first()

            if not user:
                user = User.objects.create_user(
                    email=email,
                    nama_lengkap=nama_lengkap,
                    tipe_akun=User.TipeAkun.GMAIL,
                    role=role,
                    is_email_verified=True
                )
            
            return success_response(
                data=build_auth_payload(user, request),
                message="Berhasil masuk dengan Google.",
                status_code=status.HTTP_200_OK
            )

        except ValueError as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Google token verification failed: {str(e)}")
            return error_response(message=f"Token Google tidak valid: {str(e)}", status_code=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Google login unexpected error: {type(e).__name__}: {str(e)}")
            return error_response(message="Terjadi kesalahan saat verifikasi Google.", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
