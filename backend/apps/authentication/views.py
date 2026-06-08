"""
EduTask Authentication Views
Endpoints: Register, Login, Logout, Profile, Change Password, Token Refresh
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import AuthenticationFailed, ValidationError as DRFValidationError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from apps.common.utils import success_response, error_response, validation_error_response
from apps.common.permissions import (
    LoginRateThrottle, RegisterRateThrottle,
    ChangePasswordRateThrottle,
)

from .jwt_utils import build_auth_tokens
from .models import User, Kelas, RuangEdukasi
from .serializers import (
    RegisterSerializer,
    RegisterMahasiswaSerializer,
    RegisterDosenSerializer,
    RegisterUmumSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    KelasSerializer,
    RuangEdukasiSerializer,
    JoinRuangSerializer
)


def build_auth_payload(user, request):
    return {
        'user': UserProfileSerializer(user, context={'request': request}).data,
        'tokens': build_auth_tokens(user),
    }


# ─── Register ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registrasi akun baru EduTask.
    Tidak memerlukan autentikasi.
    """
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(
                serializer.errors,
                message='Registrasi gagal. Periksa kembali data yang dimasukkan.',
            )

        user = serializer.save()

        return success_response(
            data=build_auth_payload(user, request),
            message='Registrasi berhasil! Selamat datang di EduTask.',
            status_code=status.HTTP_201_CREATED
        )


class RoleRegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]
    serializer_class = RegisterUmumSerializer
    success_message = 'Registrasi berhasil.'

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(
                serializer.errors,
                message='Registrasi gagal. Periksa kembali data yang dimasukkan.',
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
    throttle_classes = [LoginRateThrottle]

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
            return success_response(message='Token berhasil dihapus (Logout).')
        except TokenError:
            return error_response(
                message='Token tidak valid atau sudah kedaluwarsa.',
                status_code=status.HTTP_400_BAD_REQUEST
            )


# ─── Token Refresh ────────────────────────────────────────────────────────────

class CustomTokenRefreshView(TokenRefreshView):
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
            return validation_error_response(
                serializer.errors,
                message='Update profil gagal. Periksa kembali data yang dimasukkan.',
            )
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
    Semua refresh token lama di-blacklist otomatis setelah password berubah.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ChangePasswordRateThrottle]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            return validation_error_response(
                serializer.errors,
                message='Ganti password gagal. Periksa kembali data yang dimasukkan.',
            )

        request.user.set_password(serializer.validated_data['password_baru'])
        request.user.save()

        # Blacklist semua outstanding refresh token milik user ini
        # agar sesi lama tidak bisa dipakai setelah password diganti
        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
            tokens = OutstandingToken.objects.filter(user=request.user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass  # token_blacklist app mungkin tidak terinstall, lewati saja

        return success_response(
            message='Password berhasil diubah. Silakan login kembali dengan password baru.'
        )

# ─── Data Master ─────────────────────────────────────────────────────────────

class KelasListView(generics.ListAPIView):
    """
    GET /api/auth/kelas/
    Mengambil daftar semua kelas yang tersedia untuk pendaftaran mahasiswa.
    """
    queryset = Kelas.objects.all()
    serializer_class = KelasSerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message='Daftar kelas berhasil diambil.'
        )

# ─── Ruang Edukasi (Workspace Public) ───────────────────────────────────────────

def _get_subscription(user):
    """Ambil subscription user, atau return None jika belum ada."""
    try:
        return user.subscription
    except Exception:
        return None


def _get_plan(user):
    """Return plan string: 'free' / 'pro' / 'team'."""
    sub = _get_subscription(user)
    if sub and sub.is_active:
        return sub.plan
    return 'free'


# ── Batas workspace proyek per plan (mirror dari payment/models.py) ────────────
WORKSPACE_PLAN_LIMITS = {
    'free': {'max_workspace': 1,    'max_members': 3},
    'pro':  {'max_workspace': 5,    'max_members': 7},
    'team': {'max_workspace': None, 'max_members': 30},   # None = unlimited
}


class RuangEdukasiListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/auth/ruang/ → List ruang yang dikelola (kreator) atau diikuti (anggota).
    POST /api/auth/ruang/ → Buat ruang baru dengan aturan:
        • Ruang Edukasi (is_workspace=False):
            - Hanya role mahasiswa dan dosen yang boleh membuat.
            - Tidak ada batas jumlah ruang (unlimited) untuk semua plan.
        • Workspace Proyek (is_workspace=True):
            - Semua role boleh membuat.
            - Batas jumlah workspace dan anggota mengikuti plan (FREE / PRO / TEAM).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RuangEdukasiSerializer

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        return RuangEdukasi.objects.filter(Q(kreator=user) | Q(anggota=user)).distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data, message='Daftar ruang edukasi berhasil diambil.')

    def create(self, request, *args, **kwargs):
        from rest_framework import status as drf_status

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer.errors)

        is_workspace = serializer.validated_data.get('is_workspace', False)
        user = request.user
        plan = _get_plan(user)
        limits = WORKSPACE_PLAN_LIMITS[plan]

        if not is_workspace:
            # ── Ruang Edukasi ────────────────────────────────────────────────
            # Hanya mahasiswa dan dosen yang boleh membuat ruang edukasi.
            if user.role not in (User.Role.MAHASISWA, User.Role.DOSEN):
                return error_response(
                    message='Ruang Edukasi hanya dapat dibuat oleh mahasiswa atau dosen.',
                    status_code=drf_status.HTTP_403_FORBIDDEN,
                )
            # Tidak ada batas jumlah ruang edukasi (unlimited semua plan).
        else:
            # ── Workspace Proyek ─────────────────────────────────────────────
            # Hitung workspace proyek yang sudah dibuat user ini.
            owned_workspace_count = RuangEdukasi.objects.filter(
                kreator=user, is_workspace=True
            ).count()

            max_ws = limits['max_workspace']
            if max_ws is not None and owned_workspace_count >= max_ws:
                plan_label = plan.upper()
                return error_response(
                    message=(
                        f'Batas workspace plan {plan_label} adalah {max_ws} workspace. '
                        f'Upgrade plan untuk membuat lebih banyak workspace.'
                    ),
                    status_code=drf_status.HTTP_403_FORBIDDEN,
                )

        ruang = serializer.save(kreator=user)
        # Kreator otomatis menjadi anggota pertama.
        ruang.anggota.add(user)
        return success_response(
            data=self.get_serializer(ruang).data,
            message=f'Ruang "{ruang.nama_ruang}" berhasil dibuat.',
        )

class RuangEdukasiDetailView(APIView):
    """
    DELETE /api/auth/ruang/<id>/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        from django.shortcuts import get_object_or_404
        ruang = get_object_or_404(RuangEdukasi, pk=pk)
        
        # Hanya kreator yang bisa menghapus
        if ruang.kreator != request.user:
            return validation_error_response({}, message='Anda tidak memiliki akses untuk menghapus ruang ini.')
            
        ruang.delete()
        return success_response(message='Ruang edukasi berhasil dihapus.')

class RuangEdukasiJoinView(APIView):
    """
    POST /api/auth/ruang/join/
    Bergabung ke ruang via kode join.
    • Ruang Edukasi: unlimited anggota (tidak ada cek batas).
    • Workspace Proyek: cek batas anggota berdasarkan plan kreator.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from rest_framework import status as drf_status

        serializer = JoinRuangSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer.errors)

        kode = serializer.validated_data['kode_join'].strip().upper()
        try:
            ruang = RuangEdukasi.objects.get(kode_join=kode)
        except RuangEdukasi.DoesNotExist:
            return error_response(
                message='Kode join tidak valid atau ruang tidak ditemukan.',
                status_code=drf_status.HTTP_404_NOT_FOUND,
            )

        # Jika sudah menjadi anggota, kembalikan sukses saja
        if ruang.anggota.filter(id=request.user.id).exists():
            return success_response(message=f'Anda sudah menjadi anggota ruang "{ruang.nama_ruang}".')

        if ruang.is_workspace:
            # Cek batas anggota berdasarkan plan kreator workspace
            kreator_plan = _get_plan(ruang.kreator)
            limits = WORKSPACE_PLAN_LIMITS[kreator_plan]
            max_members = limits['max_members']
            current_count = ruang.anggota.count()  # sudah termasuk kreator
            if current_count >= max_members:
                return error_response(
                    message=(
                        f'Workspace ini sudah penuh ({max_members} anggota). '
                        f'Kreator perlu upgrade plan untuk menambah lebih banyak anggota.'
                    ),
                    status_code=drf_status.HTTP_403_FORBIDDEN,
                )

        ruang.anggota.add(request.user)
        return success_response(message=f'Berhasil bergabung dengan ruang "{ruang.nama_ruang}".')

class RuangEdukasiMemberView(APIView):
    """
    GET /api/auth/ruang/<id>/members/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        ruang = get_object_or_404(RuangEdukasi, pk=pk)
        
        # Harus kreator atau anggota
        if ruang.kreator != request.user and not ruang.anggota.filter(id=request.user.id).exists():
            return validation_error_response({}, message='Anda tidak memiliki akses ke ruang ini.')
            
        kreator_data = {
            'id': ruang.kreator.id,
            'nama': ruang.kreator.nama_lengkap,
            'email': ruang.kreator.email,
            'role': ruang.kreator.role
        }
        
        anggota_qs = ruang.anggota.exclude(id=ruang.kreator.id)
        anggota_data = [
            {
                'id': a.id,
                'nama': a.nama_lengkap,
                'email': a.email,
                'role': a.role
            } for a in anggota_qs
        ]
        
        return success_response({
            'kreator': kreator_data,
            'anggota': anggota_data
        }, message='Data anggota berhasil diambil.')
