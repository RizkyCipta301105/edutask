from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.common.utils import success_response, error_response

from .models import JadwalKuliah
from .serializers import JadwalKuliahSerializer


class JadwalKuliahListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = JadwalKuliah.objects.filter(user=request.user)
        hari = request.query_params.get('hari')
        if hari:
            qs = qs.filter(hari=hari)
        return success_response(JadwalKuliahSerializer(qs, many=True).data)

    def post(self, request):
        serializer = JadwalKuliahSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors, 'Gagal menambahkan jadwal kuliah.')
        serializer.save(user=request.user)
        return success_response(serializer.data, 'Jadwal kuliah berhasil ditambahkan.', status.HTTP_201_CREATED)


class JadwalKuliahDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(JadwalKuliah, pk=pk, user=user)

    def put(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        serializer = JadwalKuliahSerializer(jadwal, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(serializer.errors, 'Gagal memperbarui jadwal kuliah.')
        serializer.save()
        return success_response(serializer.data, 'Jadwal kuliah berhasil diperbarui.')

    def delete(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        jadwal.delete()
        return success_response(message='Jadwal kuliah berhasil dihapus.')
