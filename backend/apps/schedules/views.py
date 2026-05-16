from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.common.utils import success_response, validation_error_response

from .models import JadwalKuliah
from .serializers import JadwalKuliahSerializer


class JadwalKuliahListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = JadwalKuliah.objects.filter(user=request.user)
        hari = request.query_params.get('hari')
        if hari:
            qs = qs.filter(hari=hari)
        return success_response(
            data=JadwalKuliahSerializer(qs, many=True).data,
            message='Daftar jadwal kuliah berhasil diambil.',
        )

    def post(self, request):
        serializer = JadwalKuliahSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(
                serializer.errors,
                message='Gagal menambahkan jadwal kuliah. Periksa kembali data yang dimasukkan.',
            )
        serializer.save(user=request.user)
        return success_response(
            data=serializer.data,
            message='Jadwal kuliah berhasil ditambahkan.',
            status_code=status.HTTP_201_CREATED,
        )


class JadwalKuliahDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(JadwalKuliah, pk=pk, user=user)

    def put(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        serializer = JadwalKuliahSerializer(jadwal, data=request.data, partial=True)
        if not serializer.is_valid():
            return validation_error_response(
                serializer.errors,
                message='Gagal memperbarui jadwal kuliah. Periksa kembali data yang dimasukkan.',
            )
        serializer.save()
        return success_response(
            data=serializer.data,
            message='Jadwal kuliah berhasil diperbarui.',
        )

    def delete(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        jadwal.delete()
        return success_response(message='Jadwal kuliah berhasil dihapus.')
