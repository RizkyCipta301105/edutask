"""
EduTask Task Views
FR-04: Pembuatan Task
FR-05: Edit & Hapus Task
FR-07: Kanban Board Visual
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Task, MataKuliah
from .serializers import (
    TaskSerializer, TaskCreateSerializer,
    MataKuliahSerializer, KanbanMoveSerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def ok(data=None, message='', code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data}, status=code)

def err(errors=None, message='Terjadi kesalahan.', code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message, 'errors': errors}, status=code)


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
        return ok(MataKuliahSerializer(qs, many=True).data)

    def post(self, request):
        ser = MataKuliahSerializer(data=request.data)
        if not ser.is_valid():
            return err(errors=ser.errors, message='Gagal menambah mata kuliah.')
        ser.save(user=request.user)
        return ok(ser.data, 'Mata kuliah berhasil ditambahkan.', status.HTTP_201_CREATED)


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
        ser = MataKuliahSerializer(obj, data=request.data, partial=True)
        if not ser.is_valid():
            return err(errors=ser.errors, message='Gagal update mata kuliah.')
        ser.save()
        return ok(ser.data, 'Mata kuliah berhasil diperbarui.')

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user)
        obj.delete()
        return ok(message='Mata kuliah berhasil dihapus.')


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

        # ── Filter (FR-06) ──────────────────────────────────────────────────
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

        return ok(TaskSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        ser = TaskCreateSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return err(errors=ser.errors, message='Gagal membuat task.')
        task = ser.save()
        return ok(
            TaskSerializer(task, context={'request': request}).data,
            'Task berhasil dibuat.',
            status.HTTP_201_CREATED
        )


class TaskDetailView(APIView):
    """
    GET    /api/tasks/<id>/  → Detail task
    PUT    /api/tasks/<id>/  → Update task (FR-05)
    DELETE /api/tasks/<id>/  → Hapus task (FR-05)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Task, pk=pk, user=user)

    def get(self, request, pk):
        task = self.get_object(pk, request.user)
        return ok(TaskSerializer(task, context={'request': request}).data)

    def put(self, request, pk):
        task = self.get_object(pk, request.user)
        ser = TaskSerializer(task, data=request.data, partial=True, context={'request': request})
        if not ser.is_valid():
            return err(errors=ser.errors, message='Gagal mengupdate task.')
        ser.save()
        return ok(ser.data, 'Task berhasil diperbarui.')

    def patch(self, request, pk):
        """Same as PUT: partial updates via TaskSerializer(partial=True)."""
        return self.put(request, pk)

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        task.delete()
        return ok(message='Task berhasil dihapus.')


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
        return ok(board)


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
            return err(errors=ser.errors, message='Gagal memindahkan task.')

        new_status = ser.validated_data['status']
        new_urutan = ser.validated_data.get('urutan', 0)

        task.status = new_status
        task.urutan = new_urutan
        task.save(update_fields=['status', 'urutan', 'updated_at'])

        return ok(
            TaskSerializer(task, context={'request': request}).data,
            f'Task dipindahkan ke kolom {task.get_status_display()}.'
        )
