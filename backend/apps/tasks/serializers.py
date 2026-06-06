"""
EduTask Task Serializers
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.common.serializers import (
    DatetimeValidationMixin,
    MataKuliahInputValidationMixin,
    OwnershipValidationMixin,
    TaskInputValidationMixin,
)
from .models import Task, MataKuliah, PenugasanDosen, TaskComment, Notification
from apps.authentication.models import User, Kelas, RuangEdukasi

User = get_user_model()


# ── MataKuliah Serializer ────────────────────────────────────────────────────

class MataKuliahSerializer(MataKuliahInputValidationMixin, serializers.ModelSerializer):
    class Meta:
        model  = MataKuliah
        fields = ['id', 'nama', 'nama_dosen', 'warna', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Task Serializer (List & Detail) ─────────────────────────────────────────

class TaskSerializer(
    DatetimeValidationMixin,
    OwnershipValidationMixin,
    TaskInputValidationMixin,
    serializers.ModelSerializer,
):
    mata_kuliah_detail = MataKuliahSerializer(source='mata_kuliah', read_only=True)
    workspace_detail   = serializers.SerializerMethodField()
    is_overdue         = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = [
            'id', 'judul', 'deskripsi', 'deadline',
            'prioritas', 'status', 'urutan',
            'mata_kuliah', 'mata_kuliah_detail',
            'workspace', 'workspace_detail', 'attachment',
            'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_overdue']

    def get_is_overdue(self, obj):
        return obj.is_overdue

    def get_workspace_detail(self, obj):
        if obj.workspace:
            return {
                'id': str(obj.workspace.id),
                'nama_ruang': obj.workspace.nama_ruang,
                'is_workspace': obj.workspace.is_workspace
            }
        return None


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
            'prioritas', 'status', 'mata_kuliah', 'workspace', 'attachment',
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


# ── Penugasan Dosen Serializer ───────────────────────────────────────────────

class PenugasanDosenSerializer(serializers.ModelSerializer):
    dosen_nama = serializers.CharField(source='dosen.nama_lengkap', read_only=True)
    ruang_tujuan = serializers.PrimaryKeyRelatedField(
        queryset=RuangEdukasi.objects.all(), many=True
    )
    ruang_detail = serializers.SerializerMethodField()
    progress_stats = serializers.SerializerMethodField()

    class Meta:
        model = PenugasanDosen
        fields = [
            'id', 'dosen_nama', 'ruang_tujuan', 'ruang_detail', 'mata_kuliah',
            'judul', 'deskripsi', 'deadline', 'prioritas', 'progress_stats', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        
    def get_ruang_detail(self, obj):
        detail = []
        # Pre-fetched via prefetch_related in view, so this is fast
        for ruang in obj.ruang_tujuan.all():
            mhs_count = ruang.anggota.filter(is_active=True).count()
            detail.append({
                'id': str(ruang.id),
                'nama': ruang.nama_ruang,
                'kode_join': ruang.kode_join,
                'mahasiswa_count': mhs_count
            })
        return detail

    def get_progress_stats(self, obj):
        tasks = Task.objects.filter(source_assignment=obj)
        total = tasks.count()
        done = tasks.filter(status=Task.Status.DONE).count()
        in_progress = tasks.filter(status=Task.Status.IN_PROGRESS).count()
        todo = tasks.filter(status=Task.Status.TODO).count()
        
        return {
            'total': total,
            'done': done,
            'in_progress': in_progress,
            'todo': todo,
            'percentage': int((done / total * 100)) if total > 0 else 0
        }

    def create(self, validated_data):
        ruang_tujuan_data = validated_data.pop('ruang_tujuan', [])
        validated_data['dosen'] = self.context['request'].user
        penugasan = PenugasanDosen.objects.create(**validated_data)
        penugasan.ruang_tujuan.set(ruang_tujuan_data)
        return penugasan

# ── Task Comment Serializer ──────────────────────────────────────────────────

class TaskCommentSerializer(serializers.ModelSerializer):
    user_nama = serializers.CharField(source='user.nama_lengkap', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'user_nama', 'komentar', 'created_at']
        read_only_fields = ['id', 'task', 'user', 'created_at']

# ── Notification Serializer ──────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'task', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'task', 'created_at']
