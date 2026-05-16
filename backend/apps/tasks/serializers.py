"""
EduTask Task Serializers
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board
"""
from rest_framework import serializers
from apps.common.serializers import (
    DatetimeValidationMixin,
    MataKuliahInputValidationMixin,
    OwnershipValidationMixin,
    TaskInputValidationMixin,
)
from .models import Task, MataKuliah


# ── MataKuliah Serializer ────────────────────────────────────────────────────

class MataKuliahSerializer(MataKuliahInputValidationMixin, serializers.ModelSerializer):
    class Meta:
        model  = MataKuliah
        fields = ['id', 'nama', 'nama_dosen', 'warna', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Task Serializer (List & Detail) ─────────────────────────────────────────

class TaskSerializer(
    DatetimeValidationMixin,
    OwnershipValidationMixin,
    TaskInputValidationMixin,
    serializers.ModelSerializer,
):
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
        return obj.is_overdue


# ── Task Create Serializer (FR-04) ───────────────────────────────────────────

class TaskCreateSerializer(
    DatetimeValidationMixin,
    OwnershipValidationMixin,
    TaskInputValidationMixin,
    serializers.ModelSerializer,
):
    class Meta:
        model  = Task
        fields = [
            'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'mata_kuliah',
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        status = validated_data.get('status', Task.Status.TODO)
        validated_data['urutan'] = Task.objects.get_next_urutan(
            validated_data['user'],
            status,
        )
        return super().create(validated_data)


# ── Kanban Move Serializer (FR-07) ───────────────────────────────────────────

class KanbanMoveSerializer(serializers.Serializer):
    """Serializer untuk memindahkan task antar kolom Kanban (drag & drop)."""
    status = serializers.ChoiceField(choices=Task.Status.choices)
    urutan = serializers.IntegerField(min_value=0, required=False)
