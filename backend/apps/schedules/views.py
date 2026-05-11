from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import JadwalKuliah
from .serializers import JadwalKuliahSerializer


def ok(data=None, message='', code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data}, status=code)


def err(errors=None, message='Terjadi kesalahan.', code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message, 'errors': errors}, status=code)


class JadwalKuliahListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = JadwalKuliah.objects.filter(user=request.user)
        hari = request.query_params.get('hari')
        if hari:
            qs = qs.filter(hari=hari)
        return ok(JadwalKuliahSerializer(qs, many=True).data)

    def post(self, request):
        serializer = JadwalKuliahSerializer(data=request.data)
        if not serializer.is_valid():
            return err(serializer.errors, 'Gagal menambahkan jadwal kuliah.')
        serializer.save(user=request.user)
        return ok(serializer.data, 'Jadwal kuliah berhasil ditambahkan.', status.HTTP_201_CREATED)


class JadwalKuliahDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(JadwalKuliah, pk=pk, user=user)

    def put(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        serializer = JadwalKuliahSerializer(jadwal, data=request.data, partial=True)
        if not serializer.is_valid():
            return err(serializer.errors, 'Gagal memperbarui jadwal kuliah.')
        serializer.save()
        return ok(serializer.data, 'Jadwal kuliah berhasil diperbarui.')

    def delete(self, request, pk):
        jadwal = self.get_object(pk, request.user)
        jadwal.delete()
        return ok(message='Jadwal kuliah berhasil dihapus.')
