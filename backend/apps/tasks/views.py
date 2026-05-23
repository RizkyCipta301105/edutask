"""
EduTask Task Views
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board Visual
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.common.utils import success_response, validation_error_response
from .models import Task, MataKuliah
from .serializers import (
    TaskSerializer, TaskCreateSerializer,
    MataKuliahSerializer, KanbanMoveSerializer,
    PenugasanDosenSerializer, TaskCommentSerializer, NotificationSerializer
)
from .models import PenugasanDosen, TaskComment, Notification


# ════════════════════════════════════════════════════════════════════════════
#  MATA KULIAH
# ════════════════════════════════════════════════════════════════════════════

class MataKuliahListCreateView(APIView):
    """
    GET  /api/tasks/mata-kuliah/   → List semua mata kuliah milik user
    POST /api/tasks/mata-kuliah/   → Tambah mata kuliah baru
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = MataKuliah.objects.filter(user=request.user)
        return success_response(
            data=MataKuliahSerializer(qs, many=True).data,
            message='Daftar mata kuliah berhasil diambil.',
        )

    def post(self, request):
        ser = MataKuliahSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return validation_error_response(
                ser.errors,
                message='Gagal menambah mata kuliah. Periksa kembali data yang dimasukkan.',
            )
        ser.save(user=request.user)
        return success_response(
            data=ser.data,
            message='Mata kuliah berhasil ditambahkan.',
            status_code=status.HTTP_201_CREATED,
        )


class MataKuliahDetailView(APIView):
    """
    PUT    /api/tasks/mata-kuliah/<id>/  → Update
    DELETE /api/tasks/mata-kuliah/<id>/  → Hapus
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(MataKuliah, pk=pk, user=user)

    def put(self, request, pk):
        obj = self.get_object(pk, request.user)
        ser = MataKuliahSerializer(
            obj, data=request.data, partial=True, context={'request': request},
        )
        if not ser.is_valid():
            return validation_error_response(
                ser.errors,
                message='Gagal memperbarui mata kuliah. Periksa kembali data yang dimasukkan.',
            )
        ser.save()
        return success_response(
            data=ser.data,
            message='Mata kuliah berhasil diperbarui.',
        )

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user)
        obj.delete()
        return success_response(message='Mata kuliah berhasil dihapus.')


# ════════════════════════════════════════════════════════════════════════════
#  TASK  (FR-04, FR-05)
# ════════════════════════════════════════════════════════════════════════════

class TaskListCreateView(APIView):
    """
    GET  /api/tasks/             → List semua task (dengan filter)
    POST /api/tasks/             → Buat task baru (FR-04)

    Query params (GET):
      - status      : todo | in_progress | done
      - prioritas   : tinggi | sedang | rendah
      - mata_kuliah : <uuid>
      - search      : judul task
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Task.objects.filter(user=request.user).select_related('mata_kuliah')

        status_q      = request.query_params.get('status')
        prioritas_q   = request.query_params.get('prioritas')
        mata_kuliah_q = request.query_params.get('mata_kuliah')
        search_q      = request.query_params.get('search')

        if status_q:
            qs = qs.filter(status=status_q)
        if prioritas_q:
            qs = qs.filter(prioritas=prioritas_q)
        if mata_kuliah_q:
            qs = qs.filter(mata_kuliah_id=mata_kuliah_q)
        if search_q:
            qs = qs.filter(judul__icontains=search_q)

        return success_response(
            data=TaskSerializer(qs, many=True, context={'request': request}).data,
            message='Daftar task berhasil diambil.',
        )

    def post(self, request):
        ser = TaskCreateSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return validation_error_response(
                ser.errors,
                message='Gagal membuat task. Periksa kembali data yang dimasukkan.',
            )
        task = ser.save()
        return success_response(
            data=TaskSerializer(task, context={'request': request}).data,
            message='Task berhasil dibuat.',
            status_code=status.HTTP_201_CREATED,
        )


class TaskDetailView(APIView):
    """
    GET    /api/tasks/<id>/  → Detail task
    PUT    /api/tasks/<id>/  → Update task (FR-05)
    DELETE /api/tasks/<id>/  → Hapus task (FR-05)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        task = get_object_or_404(Task, pk=pk)
        if task.user == user:
            return task
        if task.source_assignment and task.source_assignment.dosen == user:
            return task
        from django.core.exceptions import PermissionDenied
        raise PermissionDenied("Anda tidak memiliki akses ke tugas ini.")

    def get(self, request, pk):
        task = self.get_object(pk, request.user)
        return success_response(
            data=TaskSerializer(task, context={'request': request}).data,
            message='Detail task berhasil diambil.',
        )

    def put(self, request, pk):
        task = self.get_object(pk, request.user)
        ser = TaskSerializer(
            task, data=request.data, partial=True, context={'request': request},
        )
        if not ser.is_valid():
            return validation_error_response(
                ser.errors,
                message='Gagal memperbarui task. Periksa kembali data yang dimasukkan.',
            )
        ser.save()
        return success_response(
            data=ser.data,
            message='Task berhasil diperbarui.',
        )

    def patch(self, request, pk):
        """Same as PUT: partial updates via TaskSerializer(partial=True)."""
        return self.put(request, pk)

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        task.delete()
        return success_response(message='Task berhasil dihapus.')


# ════════════════════════════════════════════════════════════════════════════
#  KANBAN BOARD  (FR-07)
# ════════════════════════════════════════════════════════════════════════════

class KanbanBoardView(APIView):
    """
    GET /api/tasks/kanban/
    Mengembalikan semua task dikelompokkan per kolom status:
    { todo: [...], in_progress: [...], done: [...] }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(
            user=request.user
        ).select_related('mata_kuliah').order_by('urutan', 'deadline')

        serialized = TaskSerializer(tasks, many=True, context={'request': request}).data

        board = {
            'todo':        [t for t in serialized if t['status'] == 'todo'],
            'in_progress': [t for t in serialized if t['status'] == 'in_progress'],
            'done':        [t for t in serialized if t['status'] == 'done'],
        }
        return success_response(
            data=board,
            message='Papan Kanban berhasil diambil.',
        )


class KanbanMoveView(APIView):
    """
    PATCH /api/tasks/<id>/move/
    Pindahkan task ke kolom lain (drag & drop Kanban).
    Body: { "status": "in_progress", "urutan": 0 }
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        ser  = KanbanMoveSerializer(data=request.data)

        if not ser.is_valid():
            return validation_error_response(
                ser.errors,
                message='Gagal memindahkan task. Periksa kembali data yang dimasukkan.',
            )

        new_status = ser.validated_data['status']
        new_urutan = ser.validated_data.get('urutan', 0)

        task.status = new_status
        task.urutan = new_urutan
        task.save(update_fields=['status', 'urutan', 'updated_at'])

        return success_response(
            data=TaskSerializer(task, context={'request': request}).data,
            message=f'Task dipindahkan ke kolom {task.get_status_display()}.',
        )

# ════════════════════════════════════════════════════════════════════════════
#  PENUGASAN DOSEN (LMS)
# ════════════════════════════════════════════════════════════════════════════

class PenugasanDosenListCreateView(APIView):
    """
    GET  /api/tasks/penugasan/  → List semua penugasan yang dibuat dosen ini
    POST /api/tasks/penugasan/  → Dosen membuat penugasan (Broadcast ke Mahasiswa)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'dosen':
            return validation_error_response({}, message='Akses ditolak. Hanya untuk Dosen.')
        
        qs = PenugasanDosen.objects.filter(dosen=request.user).prefetch_related('ruang_tujuan')
        return success_response(
            data=PenugasanDosenSerializer(qs, many=True).data,
            message='Daftar penugasan berhasil diambil.'
        )

    def post(self, request):
        if request.user.role != 'dosen':
            return validation_error_response({}, message='Akses ditolak. Hanya untuk Dosen.')
            
        ser = PenugasanDosenSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return validation_error_response(ser.errors, message='Gagal membuat penugasan.')
            
        penugasan = ser.save()
        return success_response(
            data=PenugasanDosenSerializer(penugasan).data,
            message='Penugasan berhasil disebarkan ke Kanban seluruh Mahasiswa terkait!',
            status_code=status.HTTP_201_CREATED
        )


class PenugasanDosenDetailView(APIView):
    """
    DELETE /api/tasks/penugasan/<id>/
    Menghapus penugasan dosen sekaligus (cascade) menghapus tugas mahasiswa terkait.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'dosen':
            return validation_error_response({}, message='Akses ditolak.')
            
        penugasan = get_object_or_404(PenugasanDosen, pk=pk, dosen=request.user)
        penugasan.delete()
        
        return success_response(
            data={},
            message='Penugasan beserta seluruh tugas di Kanban mahasiswa telah dihapus.'
        )


class PenugasanProgressView(APIView):
    """
    GET /api/tasks/penugasan/<id>/progress/
    Melihat status penyelesaian tugas oleh mahasiswa di kelas yang dituju.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        penugasan = get_object_or_404(PenugasanDosen, pk=pk, dosen=request.user)
        
        # Ambil semua task turunan dari penugasan ini
        tasks = Task.objects.filter(source_assignment=penugasan).select_related('user')
        
        progress_data = []
        stats = {'todo': 0, 'in_progress': 0, 'done': 0}
        
        for t in tasks:
            stats[t.status] += 1
            progress_data.append({
                'task_id': t.id,
                'mahasiswa_nama': t.user.nama_lengkap,
                'mahasiswa_kelas': '-',
                'status': t.get_status_display(),
                'status_raw': t.status,
                'is_overdue': t.is_overdue,
                'has_attachment': bool(t.attachment)
            })
            
        return success_response(
            data={'stats': stats, 'details': progress_data},
            message='Progres mahasiswa berhasil diambil.'
        )

class PenugasanReportView(APIView):
    """
    GET /api/tasks/penugasan/report/
    Merekap total progres seluruh mahasiswa dari SEMUA penugasan milik dosen ini.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'dosen':
            return validation_error_response({}, message='Akses ditolak.')

        tasks = Task.objects.filter(source_assignment__dosen=request.user)
        stats = {'todo': 0, 'in_progress': 0, 'done': 0}
        
        for t in tasks:
            if t.status in stats:
                stats[t.status] += 1
                
        return success_response(
            data={'stats': stats},
            message='Rekap progres dosen berhasil diambil.'
        )

# ════════════════════════════════════════════════════════════════════════════
#  TASK COMMENTS (Inbox/Diskusi)
# ════════════════════════════════════════════════════════════════════════════

class TaskCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        comments = TaskComment.objects.filter(task=task)
        return success_response(
            data=TaskCommentSerializer(comments, many=True).data,
            message='Komentar berhasil diambil.'
        )

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        ser = TaskCommentSerializer(data=request.data)
        if ser.is_valid():
            ser.save(task=task, user=request.user)
            return success_response(
                data=ser.data,
                message='Komentar berhasil ditambahkan.',
                status_code=status.HTTP_201_CREATED
            )
        return validation_error_response(ser.errors, message='Gagal menambahkan komentar.')

# ════════════════════════════════════════════════════════════════════════════
#  NOTIFICATIONS
# ════════════════════════════════════════════════════════════════════════════

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user)[:50] # limit 50
        return success_response(
            data=NotificationSerializer(notifs, many=True).data,
            message='Notifikasi berhasil diambil.'
        )

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk=None):
        if pk:
            notif = get_object_or_404(Notification, pk=pk, user=request.user)
            notif.is_read = True
            notif.save(update_fields=['is_read'])
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        
        return success_response(message='Notifikasi ditandai telah dibaca.')
