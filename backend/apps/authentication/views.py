"""
EduTask Authentication Views
Endpoints: Register, Login, Logout, Profile, Change Password, Token Refresh
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import AuthenticationFailed, ValidationError as DRFValidationError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import (
    RegisterSerializer,
    RegisterMahasiswaSerializer,
    RegisterDosenSerializer,
    RegisterUmumSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)


def success_response(data=None, message='', status_code=status.HTTP_200_OK):
    """Helper: format response sukses yang konsisten."""
    return Response({
        'success': True,
        'message': message,
        'data': data,
    }, status=status_code)


def error_response(errors=None, message='Terjadi kesalahan.', status_code=status.HTTP_400_BAD_REQUEST):
    """Helper: format response error yang konsisten."""
    return Response({
        'success': False,
        'message': message,
        'errors': errors,
    }, status=status_code)


def build_auth_payload(user, request):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    access['email'] = user.email
    access['role'] = user.role
    access['nama_lengkap'] = user.nama_lengkap
    access['tipe_akun'] = user.tipe_akun
    return {
        'user': UserProfileSerializer(user, context={'request': request}).data,
        'tokens': {
            'access': str(access),
            'refresh': str(refresh),
        }
    }


# ─── Register ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registrasi akun baru EduTask.
    Tidak memerlukan autentikasi.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message='Registrasi gagal. Periksa kembali data yang dimasukkan.',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        user = serializer.save()

        return success_response(
            data=build_auth_payload(user, request),
            message='Registrasi berhasil! Selamat datang di EduTask.',
            status_code=status.HTTP_201_CREATED
        )


class RoleRegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterUmumSerializer
    success_message = 'Registrasi berhasil.'

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message='Registrasi gagal. Periksa kembali data yang dimasukkan.',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        user = serializer.save()
        return success_response(
            data=build_auth_payload(user, request),
            message=self.success_message,
            status_code=status.HTTP_201_CREATED
        )


class RegisterMahasiswaView(RoleRegisterView):
    serializer_class = RegisterMahasiswaSerializer
    success_message = 'Registrasi mahasiswa berhasil.'


class RegisterDosenView(RoleRegisterView):
    serializer_class = RegisterDosenSerializer
    success_message = 'Registrasi dosen berhasil.'


class RegisterUmumView(RoleRegisterView):
    serializer_class = RegisterUmumSerializer
    success_message = 'Registrasi umum berhasil.'


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login dengan email + password, mendapatkan JWT access & refresh token.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            # Wrong credentials, inactive/disabled user, or other auth refusal
            # from SimpleJWT TokenObtainSerializer (not confused with bad request shape).
            return error_response(
                message='Email atau password salah.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        except DRFValidationError as exc:
            # Missing email/password, invalid types, etc. — client input issue (4xx).
            return error_response(
                errors=exc.detail,
                message='Data login tidak valid.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=serializer.validated_data,
            message='Login berhasil.'
        )


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout dengan blacklist refresh token agar tidak bisa dipakai lagi.
    Memerlukan autentikasi (Bearer token).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return error_response(
                message='Refresh token diperlukan untuk logout.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response(message='Logout berhasil.')
        except TokenError:
            return error_response(
                message='Token tidak valid atau sudah kedaluwarsa.',
                status_code=status.HTTP_400_BAD_REQUEST
            )


# ─── Token Refresh ────────────────────────────────────────────────────────────

class TokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/token/refresh/
    Perbarui access token menggunakan refresh token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            # Malformed / expired / cryptographically invalid refresh (library TokenError).
            return error_response(
                message='Refresh token tidak valid atau sudah kedaluwarsa. Silakan login kembali.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        except AuthenticationFailed:
            # Some SimpleJWT paths surface invalid refresh as DRF AuthenticationFailed.
            return error_response(
                message='Refresh token tidak valid atau sudah kedaluwarsa. Silakan login kembali.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        except DRFValidationError as exc:
            # Missing `refresh`, blacklist text validation, etc. — keep envelope + field errors.
            return error_response(
                errors=exc.detail,
                message='Permintaan refresh token tidak valid.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=serializer.validated_data,
            message='Token berhasil diperbarui.'
        )


# ─── Profile ──────────────────────────────────────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/   → Ambil profil user yang sedang login
    PUT  /api/auth/profile/   → Update nama / foto profil
    PATCH /api/auth/profile/  → Partial update
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return success_response(
            data=serializer.data,
            message='Data profil berhasil diambil.'
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(
            self.get_object(),
            data=request.data,
            partial=partial,
            context={'request': request}
        )
        if not serializer.is_valid():
            return error_response(errors=serializer.errors, message='Update profil gagal.')
        serializer.save()
        return success_response(
            data=serializer.data,
            message='Profil berhasil diperbarui.'
        )


# ─── Change Password ──────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Ganti password user yang sedang login.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            return error_response(errors=serializer.errors, message='Ganti password gagal.')

        request.user.set_password(serializer.validated_data['password_baru'])
        request.user.save()

        return success_response(
            message='Password berhasil diubah. Silakan login kembali dengan password baru.'
        )
