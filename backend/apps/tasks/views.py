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
)


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
        return get_object_or_404(Task, pk=pk, user=user)

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
