"""
EduTask Task Serializers
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Task, MataKuliah


# ── MataKuliah Serializer ────────────────────────────────────────────────────

class MataKuliahSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MataKuliah
        fields = ['id', 'nama', 'nama_dosen', 'warna', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Task Serializer (List & Detail) ─────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    mata_kuliah_detail = MataKuliahSerializer(source='mata_kuliah', read_only=True)
    is_overdue         = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Task
        fields = [
            'id', 'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'urutan',
            'mata_kuliah', 'mata_kuliah_detail',
            'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_overdue']

    def validate_deadline(self, value):
        """Deadline tidak boleh di masa lalu saat pertama kali dibuat."""
        if self.instance is None:   # hanya saat CREATE
            if value < timezone.now().date():
                raise serializers.ValidationError(
                    'Deadline tidak boleh di masa lalu.'
                )
        return value

    def validate_mata_kuliah(self, value):
        """Pastikan mata kuliah milik user yang sedang login."""
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError(
                'Mata kuliah tidak ditemukan.'
            )
        return value


# ── Task Create Serializer (FR-04) ───────────────────────────────────────────

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Task
        fields = [
            'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'mata_kuliah',
        ]

    def validate_deadline(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Deadline tidak boleh di masa lalu.')
        return value

    def validate_mata_kuliah(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError('Mata kuliah tidak valid.')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Set urutan = total task user + 1
        count = Task.objects.filter(
            user=validated_data['user'],
            status=validated_data.get('status', Task.Status.TODO)
        ).count()
        validated_data['urutan'] = count
        return super().create(validated_data)


# ── Kanban Move Serializer (FR-07) ───────────────────────────────────────────

class KanbanMoveSerializer(serializers.Serializer):
    """Serializer untuk memindahkan task antar kolom Kanban (drag & drop)."""
    status = serializers.ChoiceField(choices=Task.Status.choices)
    urutan = serializers.IntegerField(min_value=0, required=False)

    def validate_status(self, value):
        return value
