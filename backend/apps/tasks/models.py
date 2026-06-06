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
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from apps.authentication.models import User, Kelas

def validate_file_size(value):
    filesize = value.size
    if filesize > 10485760: # 10MB
        raise ValidationError("Ukuran file maksimal adalah 10MB")
    return value


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
    ruangan = models.CharField(max_length=150, blank=True, null=True, verbose_name='Ruangan / Link Zoom')
    
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
    source_assignment = models.ForeignKey(
        'PenugasanDosen', on_delete=models.CASCADE,
        null=True, blank=True, related_name='distributed_tasks',
        verbose_name='Sumber Penugasan Dosen'
    )
    workspace = models.ForeignKey(
        'authentication.RuangEdukasi', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='workspace_tasks',
        verbose_name='Workspace Kolaborasi'
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
    attachment  = models.FileField(
        upload_to='task_attachments/', null=True, blank=True,
        verbose_name='Lampiran Berkas',
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'xls', 'xlsx']),
            validate_file_size
        ]
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
        if not self.deadline:
            return False
        return self.deadline < timezone.now().date() and self.status != self.Status.DONE




class PenugasanDosen(models.Model):
    """Master penugasan yang dibuat oleh dosen untuk disebar ke kelas (Broadcast)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dosen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='penugasan_dibuat')
    ruang_tujuan = models.ManyToManyField('authentication.RuangEdukasi', related_name='penugasan_diterima')
    mata_kuliah = models.CharField(max_length=120, verbose_name='Mata Kuliah')
    
    judul = models.CharField(max_length=200, verbose_name='Judul Tugas')
    deskripsi = models.TextField(blank=True, verbose_name='Deskripsi')
    deadline = models.DateField(null=True, blank=True, verbose_name='Deadline')
    prioritas = models.CharField(max_length=10, choices=Task.Prioritas.choices, default=Task.Prioritas.SEDANG)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'penugasan_dosen'
        ordering = ['-created_at']
        verbose_name = 'Penugasan Dosen'
        verbose_name_plural = 'Penugasan Dosen'

    def __str__(self):
        return f"{self.judul} - {self.dosen.nama_lengkap}"

class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments')
    komentar = models.TextField(verbose_name='Komentar')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_comment'
        ordering = ['created_at']

class Notification(models.Model):
    """Sistem notifikasi untuk user, misal: reminder deadline."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_notification'
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{self.title} - {self.user.email}"

# Register signals
import apps.tasks.signals  # noqa
