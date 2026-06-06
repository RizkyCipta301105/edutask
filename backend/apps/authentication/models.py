"""
EduTask Authentication Models
Custom User model supporting Gmail OAuth, PENS, and general accounts
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils import timezone


import random
import string

def generate_join_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class RuangEdukasi(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kode_join = models.CharField(max_length=10, unique=True, default=generate_join_code)
    nama_ruang = models.CharField(max_length=100, verbose_name='Nama Ruang')
    deskripsi = models.TextField(blank=True, verbose_name='Deskripsi')
    kreator = models.ForeignKey('User', on_delete=models.CASCADE, related_name='ruang_dibuat')
    anggota = models.ManyToManyField('User', related_name='ruang_diikuti', blank=True)
    is_workspace = models.BooleanField(default=False, verbose_name='Apakah Workspace Proyek?')
    
    class HariPilihan(models.IntegerChoices):
        SENIN = 1, 'Senin'
        SELASA = 2, 'Selasa'
        RABU = 3, 'Rabu'
        KAMIS = 4, 'Kamis'
        JUMAT = 5, 'Jumat'
        SABTU = 6, 'Sabtu'
        MINGGU = 0, 'Minggu'

    hari = models.IntegerField(choices=HariPilihan.choices, null=True, blank=True, verbose_name='Hari Kuliah')
    jam_mulai = models.TimeField(null=True, blank=True, verbose_name='Jam Mulai')
    jam_selesai = models.TimeField(null=True, blank=True, verbose_name='Jam Selesai')
    ruangan = models.CharField(max_length=150, null=True, blank=True, verbose_name='Ruangan / Link Zoom')
    warna = models.CharField(max_length=7, default='#8B6914', verbose_name='Warna (hex)')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ruang_edukasi'
        verbose_name = 'Ruang Edukasi'
        verbose_name_plural = 'Ruang Edukasi'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nama_ruang} ({self.kode_join})"

class Kelas(models.Model):
    """Model untuk kelas/rombongan belajar mahasiswa."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama = models.CharField(max_length=50, unique=True, verbose_name='Nama Kelas')
    tingkat = models.PositiveIntegerField(verbose_name='Tingkat / Tahun')
    prodi = models.CharField(max_length=100, verbose_name='Program Studi')
    
    class Meta:
        db_table = 'kelas'
        verbose_name = 'Kelas'
        verbose_name_plural = 'Kelas'
        ordering = ['tingkat', 'nama']

    def __str__(self):
        return self.nama
class UserManager(BaseUserManager):
    """Custom manager for EduTask User model."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email wajib diisi.')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('tipe_akun', User.TipeAkun.UMUM)
        extra_fields.setdefault('role', User.Role.UMUM)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model untuk EduTask.
    Mendukung tiga tipe akun: Gmail (OAuth), PENS (institusi), Umum.
    """

    class TipeAkun(models.TextChoices):
        GMAIL = 'gmail', 'Gmail OAuth'
        PENS = 'pens', 'Akun PENS'
        UMUM = 'umum', 'Pengguna Umum'

    class Role(models.TextChoices):
        MAHASISWA = 'mahasiswa', 'Mahasiswa'
        DOSEN = 'dosen', 'Dosen'
        UMUM = 'umum', 'Umum'

    # Primary Key pakai UUID agar lebih aman
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identitas dasar
    email = models.EmailField(unique=True, verbose_name='Email')
    nama_lengkap = models.CharField(max_length=100, verbose_name='Nama Lengkap')
    foto_profil = models.ImageField(
        upload_to='profil/', null=True, blank=True, verbose_name='Foto Profil'
    )

    # Tipe akun
    tipe_akun = models.CharField(
        max_length=10,
        choices=TipeAkun.choices,
        default=TipeAkun.UMUM,
        verbose_name='Tipe Akun'
    )
    role = models.CharField(
        max_length=12,
        choices=Role.choices,
        default=Role.UMUM,
        verbose_name='Role'
    )
    prodi = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Program Studi'
    )
    kelas = models.ForeignKey(
        Kelas,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mahasiswa_list',
        verbose_name='Kelas Mahasiswa'
    )
    mata_kuliah = models.CharField(
        max_length=120,
        blank=True,
        verbose_name='Mata Kuliah Dosen'
    )

    # Kode Undangan Chat
    chat_code = models.CharField(
        max_length=6, unique=True, null=True, blank=True, verbose_name='Kode Chat'
    )

    # Status
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    is_email_verified = models.BooleanField(default=False, verbose_name='Email Terverifikasi')

    # Timestamps
    tanggal_daftar = models.DateTimeField(default=timezone.now, verbose_name='Tanggal Daftar')
    last_login = models.DateTimeField(null=True, blank=True, verbose_name='Login Terakhir')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nama_lengkap']

    class Meta:
        verbose_name = 'Pengguna'
        verbose_name_plural = 'Pengguna'
        db_table = 'auth_user_edutask'
        ordering = ['-tanggal_daftar']

    def __str__(self):
        return f'{self.nama_lengkap} <{self.email}>'

    def save(self, *args, **kwargs):
        if not self.chat_code:
            # Generate if doesn't exist, handle uniqueness
            self.chat_code = generate_join_code()
            # Basic collision prevention
            while User.objects.filter(chat_code=self.chat_code).exists():
                self.chat_code = generate_join_code()
        super().save(*args, **kwargs)

    @property
    def is_pens_user(self):
        return self.tipe_akun == self.TipeAkun.PENS or self.role == self.Role.MAHASISWA

    def get_foto_profil_url(self):
        if self.foto_profil:
            return self.foto_profil.url
        # Return default avatar placeholder
        return None

class VerificationToken(models.Model):
    class TokenType(models.TextChoices):
        EMAIL = 'email', 'Email Verification'
        PASSWORD = 'password', 'Password Reset'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    token_type = models.CharField(max_length=10, choices=TokenType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'verification_tokens'
        verbose_name = 'Verification Token'
        verbose_name_plural = 'Verification Tokens'

    def __str__(self):
        return f"{self.token_type} - {self.user.email}"

    @property
    def is_valid(self):
        return timezone.now() <= self.expires_at
