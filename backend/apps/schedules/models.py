import uuid
from django.db import models
from apps.authentication.models import User


class JadwalKuliah(models.Model):
    class Hari(models.TextChoices):
        SENIN = 'senin', 'Senin'
        SELASA = 'selasa', 'Selasa'
        RABU = 'rabu', 'Rabu'
        KAMIS = 'kamis', 'Kamis'
        JUMAT = 'jumat', 'Jumat'
        SABTU = 'sabtu', 'Sabtu'
        MINGGU = 'minggu', 'Minggu'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jadwal_kuliah')
    hari = models.CharField(max_length=10, choices=Hari.choices)
    jam = models.CharField(max_length=30, help_text='Contoh: 08:00-10:00')
    ruangan = models.CharField(max_length=80)
    dosen = models.CharField(max_length=100)
    mata_kuliah = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jadwal_kuliah'
        ordering = ['hari', 'jam', 'mata_kuliah']

    def __str__(self):
        return f'{self.get_hari_display()} {self.jam} - {self.mata_kuliah}'
