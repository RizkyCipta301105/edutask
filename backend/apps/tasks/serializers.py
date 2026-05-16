"""
EduTask Task Serializers
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board
"""
import re
from rest_framework import serializers
from apps.common.serializers import DatetimeValidationMixin, OwnershipValidationMixin
from .models import Task, MataKuliah


# ── MataKuliah Serializer ────────────────────────────────────────────────────

class MataKuliahSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MataKuliah
        fields = ['id', 'nama', 'nama_dosen', 'warna', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_nama(self, value):
        """Pastikan nama mata kuliah tidak kosong dan tidak duplikat per user."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Nama mata kuliah tidak boleh kosong.')
        # Cek duplikat hanya saat create atau saat nama diubah
        request = self.context.get('request')
        if request:
            qs = MataKuliah.objects.filter(user=request.user, nama__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Mata kuliah dengan nama ini sudah ada.')
        return value

    def validate_warna(self, value):
        """Pastikan warna adalah kode hex yang valid (contoh: #1A2B3C)."""
        if not re.fullmatch(r'#[0-9A-Fa-f]{6}', value):
            raise serializers.ValidationError(
                'Warna harus berupa kode hex 6 digit yang valid (contoh: #1A2B3C).'
            )
        return value.upper()


# ── Task Serializer (List & Detail) ─────────────────────────────────────────

class TaskSerializer(DatetimeValidationMixin, OwnershipValidationMixin, serializers.ModelSerializer):
    mata_kuliah_detail = MataKuliahSerializer(source='mata_kuliah', read_only=True)
    is_overdue         = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = [
            'id', 'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'urutan',
            'mata_kuliah', 'mata_kuliah_detail',
            'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_overdue']

    def get_is_overdue(self, obj):
        """Retrieve is_overdue property from model."""
        return obj.is_overdue

    def validate_judul(self, value):
        """Sanitize dan validasi judul task."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Judul task tidak boleh kosong.')
        return value

    def validate_deskripsi(self, value):
        """Sanitize deskripsi task."""
        return value.strip() if value else value

    def validate_mata_kuliah(self, value):
        """Pastikan mata kuliah milik user yang sedang login."""
        return self.validate_resource_owner(value, 'Mata kuliah')


# ── Task Create Serializer (FR-04) ───────────────────────────────────────────

class TaskCreateSerializer(DatetimeValidationMixin, OwnershipValidationMixin, serializers.ModelSerializer):
    class Meta:
        model  = Task
        fields = [
            'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'mata_kuliah',
        ]

    def validate_judul(self, value):
        """Sanitize dan validasi judul task."""
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Judul task tidak boleh kosong.')
        return value

    def validate_deskripsi(self, value):
        """Sanitize deskripsi task."""
        return value.strip() if value else value

    def validate_mata_kuliah(self, value):
        """Pastikan mata kuliah milik user yang sedang login."""
        return self.validate_resource_owner(value, 'Mata kuliah')

    def create(self, validated_data):
        """Create task with auto-assigned urutan based on status."""
        validated_data['user'] = self.context['request'].user
        status = validated_data.get('status', Task.Status.TODO)
        # Use model manager to get next urutan
        validated_data['urutan'] = Task.objects.get_next_urutan(
            validated_data['user'],
            status
        )
        return super().create(validated_data)


# ── Kanban Move Serializer (FR-07) ───────────────────────────────────────────

class KanbanMoveSerializer(serializers.Serializer):
    """Serializer untuk memindahkan task antar kolom Kanban (drag & drop)."""
    status = serializers.ChoiceField(choices=Task.Status.choices)
    urutan = serializers.IntegerField(min_value=0, required=False)

    def validate_status(self, value):
        return value
