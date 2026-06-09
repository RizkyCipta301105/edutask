"""
EduTask Authentication Serializers
Handles Register, Login, Profile, Token
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.common.serializers import NamaLengkapValidationMixin, PasswordValidationMixin
from .jwt_utils import apply_user_claims
from .models import User, Kelas, RuangEdukasi

CAMPUS_EMAIL_DOMAINS = ('@student.pens.ac.id', '@pens.ac.id')
PRODI_CHOICES = {
    'Teknologi Rekayasa Internet',
    'Teknik Informatika',
    'Teknik Elektro',
    'Sistem Informasi',
}


# ─── Custom JWT Token - tambahkan user info ke payload ───────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extend JWT payload dengan data user EduTask."""

    @classmethod
    def get_token(cls, user):
        return apply_user_claims(super().get_token(user), user)

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserProfileSerializer(self.user).data
        return data


# ─── Kelas Serializer ────────────────────────────────────────────────────────

class KelasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kelas
        fields = ['id', 'nama', 'tingkat', 'prodi']


# ─── Ruang Edukasi Serializer ────────────────────────────────────────────────────────

class RuangEdukasiSerializer(serializers.ModelSerializer):
    kreator_nama = serializers.CharField(source='kreator.nama_lengkap', read_only=True)
    kreator_id = serializers.UUIDField(source='kreator.id', read_only=True)
    jumlah_anggota = serializers.SerializerMethodField()

    class Meta:
        model = RuangEdukasi
        fields = [
            'id', 'kode_join', 'nama_ruang', 'deskripsi', 
            'kreator_nama', 'kreator_id', 'jumlah_anggota', 'created_at',
            'hari', 'jam_mulai', 'jam_selesai', 'ruangan', 'warna', 'is_workspace'
        ]
        read_only_fields = ['id', 'kode_join', 'kreator_nama', 'kreator_id', 'jumlah_anggota', 'created_at']

    def get_jumlah_anggota(self, obj):
        return obj.anggota.count()

    def validate(self, attrs):
        jam_mulai = attrs.get('jam_mulai')
        jam_selesai = attrs.get('jam_selesai')

        if (jam_mulai and not jam_selesai) or (jam_selesai and not jam_mulai):
            raise serializers.ValidationError({
                'jam_mulai': 'Jam mulai dan jam selesai harus diisi bersamaan.'
            })

        if jam_mulai and jam_selesai and jam_mulai >= jam_selesai:
            raise serializers.ValidationError({
                'jam_mulai': 'Jam mulai harus sebelum jam selesai.'
            })

        return attrs

class JoinRuangSerializer(serializers.Serializer):
    kode_join = serializers.CharField(required=True, max_length=10)


# ─── Register Serializer ─────────────────────────────────────────────────────

class RegisterSerializer(
    NamaLengkapValidationMixin,
    PasswordValidationMixin,
    serializers.ModelSerializer,
):
    """Serializer untuk registrasi akun baru."""

    password = serializers.CharField(
        write_only=True, required=True, min_length=8,
        style={'input_type': 'password'},
        error_messages={'min_length': 'Password minimal 8 karakter.'}
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'nama_lengkap', 'tipe_akun', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True},
            'nama_lengkap': {'required': True},
            'tipe_akun': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email ini sudah terdaftar.')
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password dan konfirmasi password tidak cocok.'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        tipe_akun = validated_data.get('tipe_akun')
        validated_data['role'] = User.Role.MAHASISWA if tipe_akun == User.TipeAkun.PENS else User.Role.UMUM
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class BaseRoleRegisterSerializer(
    NamaLengkapValidationMixin,
    PasswordValidationMixin,
    serializers.ModelSerializer,
):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
        error_messages={'min_length': 'Password minimal 8 karakter.'}
    )

    class Meta:
        model = User
        fields = ['nama_lengkap', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email ini sudah terdaftar.')
        return value.lower()

    def create_user(self, validated_data, role, **extra_fields):
        password = validated_data.pop('password')
        user = User(
            **validated_data,
            role=role,
            tipe_akun=User.TipeAkun.PENS if role in [User.Role.MAHASISWA, User.Role.DOSEN] else User.TipeAkun.UMUM,
            **extra_fields,
        )
        user.set_password(password)
        user.save()
        return user


class RegisterUmumSerializer(BaseRoleRegisterSerializer):
    def create(self, validated_data):
        return self.create_user(validated_data, User.Role.UMUM)


class RegisterMahasiswaSerializer(BaseRoleRegisterSerializer):
    class Meta(BaseRoleRegisterSerializer.Meta):
        fields = ['nama_lengkap', 'email', 'password']

    def validate_email(self, value):
        value = super().validate_email(value)
        if not value.endswith(CAMPUS_EMAIL_DOMAINS):
            raise serializers.ValidationError('Email harus menggunakan domain kampus.')
        return value

    def create(self, validated_data):
        return self.create_user(
            validated_data,
            User.Role.MAHASISWA,
        )


class RegisterDosenSerializer(BaseRoleRegisterSerializer):
    mata_kuliah = serializers.CharField(required=True, max_length=120)

    class Meta(BaseRoleRegisterSerializer.Meta):
        fields = ['nama_lengkap', 'email', 'mata_kuliah', 'password']

    def validate_email(self, value):
        value = super().validate_email(value)
        if not value.endswith(CAMPUS_EMAIL_DOMAINS):
            raise serializers.ValidationError('Email dosen harus menggunakan domain kampus.')
        return value

    def create(self, validated_data):
        mata_kuliah = validated_data.pop('mata_kuliah')
        return self.create_user(
            validated_data,
            User.Role.DOSEN,
            mata_kuliah=mata_kuliah,
        )


# ─── Profile Serializer ──────────────────────────────────────────────────────

class UserProfileSerializer(NamaLengkapValidationMixin, serializers.ModelSerializer):
    """Serializer untuk data profil user (read & update)."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nama_lengkap', 'tipe_akun', 'role',
            'prodi', 'mata_kuliah', 'chat_code',
            'is_email_verified', 'tanggal_daftar', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'tipe_akun', 'role', 'prodi',
            'mata_kuliah', 'chat_code', 'is_email_verified', 'tanggal_daftar', 'last_login'
        ]
# ─── Change Password Serializer ───────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer untuk ganti password."""

    password_lama = serializers.CharField(required=True, write_only=True)
    password_baru = serializers.CharField(required=True, write_only=True, min_length=8)
    password_baru_confirm = serializers.CharField(required=True, write_only=True)

    def validate_password_lama(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Password lama tidak sesuai.')
        return value

    def validate(self, attrs):
        user = self.context['request'].user

        if user.check_password(attrs['password_baru']):
            raise serializers.ValidationError({
                'password_baru': 'Password baru tidak boleh sama dengan password lama.'
            })

        if attrs['password_baru'] != attrs['password_baru_confirm']:
            raise serializers.ValidationError({
                'password_baru_confirm': 'Password baru dan konfirmasi tidak cocok.'
            })
        try:
            validate_password(attrs['password_baru'], user)
        except ValidationError as e:
            raise serializers.ValidationError({'password_baru': list(e.messages)})
        return attrs
