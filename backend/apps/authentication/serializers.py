"""
EduTask Authentication Serializers
Handles Register, Login, Profile, Token
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User

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
        token = super().get_token(user)
        # Tambah custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['nama_lengkap'] = user.nama_lengkap
        token['tipe_akun'] = user.tipe_akun
        token['is_email_verified'] = user.is_email_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Tambahkan info user ke response body juga
        data['user'] = UserProfileSerializer(self.user).data
        return data


# ─── Register Serializer ─────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
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
        """Cek duplikasi email (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email ini sudah terdaftar.')
        return value.lower()

    def validate_nama_lengkap(self, value):
        """Sanitize nama lengkap: hapus spasi berlebih, pastikan tidak kosong."""
        value = ' '.join(value.split())
        if not value:
            raise serializers.ValidationError('Nama lengkap tidak boleh kosong.')
        return value

    def validate_password(self, value):
        """Jalankan Django built-in password validators."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Validasi password dan konfirmasi password sama."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password dan konfirmasi password tidak cocok.'
            })
        return attrs

    def create(self, validated_data):
        """Buat user baru dengan password terenkripsi (bcrypt via Django)."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        tipe_akun = validated_data.get('tipe_akun')
        validated_data['role'] = User.Role.MAHASISWA if tipe_akun == User.TipeAkun.PENS else User.Role.UMUM
        user = User(**validated_data)
        user.set_password(password)  # Django memakai hasher aktif dari PASSWORD_HASHERS.
        user.save()
        return user


class BaseRoleRegisterSerializer(serializers.ModelSerializer):
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

    def validate_nama_lengkap(self, value):
        """Sanitize nama lengkap: hapus spasi berlebih, pastikan tidak kosong."""
        value = ' '.join(value.split())
        if not value:
            raise serializers.ValidationError('Nama lengkap tidak boleh kosong.')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create_user(self, validated_data, role, **extra_fields):
        password = validated_data.pop('password')
        user = User(
            **validated_data,
            role=role,
            tipe_akun=User.TipeAkun.PENS if role == User.Role.MAHASISWA else User.TipeAkun.UMUM,
            **extra_fields,
        )
        user.set_password(password)
        user.save()
        return user


class RegisterUmumSerializer(BaseRoleRegisterSerializer):
    def create(self, validated_data):
        return self.create_user(validated_data, User.Role.UMUM)


class RegisterMahasiswaSerializer(BaseRoleRegisterSerializer):
    nrp = serializers.CharField(required=True, max_length=30)
    prodi = serializers.CharField(required=True, max_length=100)

    class Meta(BaseRoleRegisterSerializer.Meta):
        fields = ['nama_lengkap', 'nrp', 'email', 'password', 'prodi']

    def validate_email(self, value):
        value = super().validate_email(value)
        if not value.endswith(CAMPUS_EMAIL_DOMAINS):
            raise serializers.ValidationError('Email harus menggunakan domain kampus PENS.')
        return value

    def validate_nrp(self, value):
        value = value.strip()
        if User.objects.filter(nrp__iexact=value).exists():
            raise serializers.ValidationError('NRP/NIM sudah terdaftar.')
        return value

    def validate_prodi(self, value):
        if value not in PRODI_CHOICES:
            raise serializers.ValidationError('Program studi tidak valid.')
        return value

    def create(self, validated_data):
        nrp = validated_data.pop('nrp')
        prodi = validated_data.pop('prodi')
        return self.create_user(
            validated_data,
            User.Role.MAHASISWA,
            nrp=nrp,
            prodi=prodi,
        )


class RegisterDosenSerializer(BaseRoleRegisterSerializer):
    nip = serializers.CharField(required=True, max_length=30)
    mata_kuliah = serializers.CharField(required=True, max_length=120)

    class Meta(BaseRoleRegisterSerializer.Meta):
        fields = ['nama_lengkap', 'nip', 'email', 'mata_kuliah', 'password']

    def validate_nip(self, value):
        value = value.strip()
        if User.objects.filter(nip__iexact=value).exists():
            raise serializers.ValidationError('NIP sudah terdaftar.')
        return value

    def create(self, validated_data):
        nip = validated_data.pop('nip')
        mata_kuliah = validated_data.pop('mata_kuliah')
        return self.create_user(
            validated_data,
            User.Role.DOSEN,
            nip=nip,
            mata_kuliah=mata_kuliah,
        )


# ─── Profile Serializer ──────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer untuk data profil user (read & update)."""

    foto_profil_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nama_lengkap', 'tipe_akun', 'role',
            'nrp', 'prodi', 'nip', 'mata_kuliah',
            'foto_profil', 'foto_profil_url',
            'is_email_verified', 'tanggal_daftar', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'tipe_akun', 'role', 'nrp', 'prodi', 'nip',
            'mata_kuliah', 'is_email_verified', 'tanggal_daftar', 'last_login'
        ]
        extra_kwargs = {
            'foto_profil': {'write_only': True, 'required': False}
        }

    def get_foto_profil_url(self, obj):
        request = self.context.get('request')
        if obj.foto_profil and request:
            return request.build_absolute_uri(obj.foto_profil.url)
        return None


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
        
        # Check if new password is different from old password
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
