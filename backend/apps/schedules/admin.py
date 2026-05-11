from django.contrib import admin
from .models import JadwalKuliah


@admin.register(JadwalKuliah)
class JadwalKuliahAdmin(admin.ModelAdmin):
    list_display = ('mata_kuliah', 'hari', 'jam', 'ruangan', 'dosen', 'user')
    list_filter = ('hari',)
    search_fields = ('mata_kuliah', 'dosen', 'ruangan', 'user__email')
