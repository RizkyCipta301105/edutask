"""
EduTask Task Models
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board Visual
"""
import uuid
from django.db import models
from django.db.models import Max
from django.utils import timezone
from apps.authentication.models import User


# ════════════════════════════════════════════════════════════════════════════
#  TASK MANAGER
# ════════════════════════════════════════════════════════════════════════════

class TaskManager(models.Manager):
    """Custom manager for Task model with business logic helpers."""
    
    def get_next_urutan(self, user, status):
        """
        Get the next urutan (ordering) for a task in a given status.
        Used when creating new tasks to auto-assign position.
        
        Args:
            user: User object
            status: Task status
        
        Returns:
            Next available urutan (int)
        """
        max_urutan = self.filter(
            user=user,
            status=status
        ).aggregate(Max('urutan'))['urutan__max'] or -1
        return max_urutan + 1


class MataKuliah(models.Model):
    """Mata kuliah milik user — dipakai sebagai kategori task."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mata_kuliah_list')
    nama = models.CharField(max_length=100, verbose_name='Nama Mata Kuliah')
    nama_dosen = models.CharField(max_length=100, blank=True, verbose_name='Nama Dosen')
    warna = models.CharField(max_length=7, default='#8B6914', verbose_name='Warna (hex)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mata_kuliah'
        ordering = ['nama']
        verbose_name = 'Mata Kuliah'
        verbose_name_plural = 'Mata Kuliah'

    def __str__(self):
        return f'{self.nama} ({self.user.email})'


class Task(models.Model):
    """Entitas Task utama EduTask."""

    class Prioritas(models.TextChoices):
        TINGGI = 'tinggi', 'Tinggi'
        SEDANG = 'sedang', 'Sedang'
        RENDAH = 'rendah', 'Rendah'

    class Status(models.TextChoices):
        TODO       = 'todo',        'To Do'
        IN_PROGRESS= 'in_progress', 'In Progress'
        DONE       = 'done',        'Done'

    # ── Managers ─────────────────────────────────────────────────────────────
    objects = TaskManager()

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ── Relasi ───────────────────────────────────────────────────────────────
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='tasks'
    )
    mata_kuliah = models.ForeignKey(
        MataKuliah, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tasks',
        verbose_name='Mata Kuliah'
    )

    # ── Data Task ─────────────────────────────────────────────────────────────
    judul       = models.CharField(max_length=200, verbose_name='Judul Task')
    deskripsi   = models.TextField(blank=True, verbose_name='Deskripsi')
    deadline    = models.DateField(verbose_name='Deadline')
    prioritas   = models.CharField(
        max_length=10, choices=Prioritas.choices,
        default=Prioritas.SEDANG, verbose_name='Prioritas'
    )
    status      = models.CharField(
        max_length=15, choices=Status.choices,
        default=Status.TODO, verbose_name='Status'
    )

    # ── Kanban order (urutan kartu dalam kolom) ────────────────────────────
    urutan = models.PositiveIntegerField(default=0, verbose_name='Urutan')

    # ── Timestamps ───────────────────────────────────────────────────────────
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'task'
        ordering  = ['urutan', 'deadline', '-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f'[{self.status}] {self.judul} – {self.user.email}'

    @property
    def is_overdue(self):
        return self.deadline < timezone.now().date() and self.status != self.Status.DONE
