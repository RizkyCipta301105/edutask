from rest_framework import serializers
from apps.common.serializers import ScheduleInputValidationMixin
from .models import JadwalKuliah


class JadwalKuliahSerializer(ScheduleInputValidationMixin, serializers.ModelSerializer):
    hari_display = serializers.CharField(source='get_hari_display', read_only=True)

    class Meta:
        model = JadwalKuliah
        fields = [
            'id', 'hari', 'hari_display', 'jam', 'ruangan',
            'dosen', 'mata_kuliah', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'hari_display', 'created_at', 'updated_at']
