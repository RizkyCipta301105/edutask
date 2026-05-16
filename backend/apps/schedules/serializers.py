import re
from rest_framework import serializers
from .models import JadwalKuliah


class JadwalKuliahSerializer(serializers.ModelSerializer):
    hari_display = serializers.CharField(source='get_hari_display', read_only=True)

    class Meta:
        model = JadwalKuliah
        fields = [
            'id', 'hari', 'hari_display', 'jam', 'ruangan',
            'dosen', 'mata_kuliah', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'hari_display', 'created_at', 'updated_at']

    def validate_jam(self, value):
        """Validasi format waktu jadwal (contoh: 08:00-10:00 atau 08:00 - 10:00)."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Jam jadwal tidak boleh kosong.')
        pattern = r'^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                'Format jam tidak valid. Gunakan format HH:MM-HH:MM (contoh: 08:00-10:00).'
            )
        return value

    def validate_ruangan(self, value):
        """Pastikan ruangan tidak kosong."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Ruangan tidak boleh kosong.')
        return value

    def validate_dosen(self, value):
        """Pastikan nama dosen tidak kosong."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Nama dosen tidak boleh kosong.')
        return value

    def validate_mata_kuliah(self, value):
        """Pastikan nama mata kuliah tidak kosong."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Nama mata kuliah tidak boleh kosong.')
        return value
