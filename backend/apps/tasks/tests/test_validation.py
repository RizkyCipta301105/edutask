"""
Task and mata kuliah serializer validation tests.
"""
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User
from apps.common.test_utils import AuthTestMixin
from apps.tasks.models import MataKuliah


class TaskValidationAPITestCase(AuthTestMixin, APITestCase):
    def setUp(self):
        self.url_tasks = reverse('task-list')
        self.url_mk = reverse('mata-kuliah-list')

    def test_create_task_rejects_blank_judul(self):
        User.objects.create_user(
            email='val_judul@example.com', password='Pass12345!', nama_lengkap='V',
        )
        self._login('val_judul@example.com', 'Pass12345!')
        deadline = (timezone.now().date() + timedelta(days=2)).isoformat()
        response = self.client.post(
            self.url_tasks,
            {'judul': '   ', 'deadline': deadline, 'prioritas': 'sedang', 'status': 'todo'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('judul', response.data['errors'])

    def test_create_mata_kuliah_rejects_invalid_warna(self):
        User.objects.create_user(
            email='val_warna@example.com', password='Pass12345!', nama_lengkap='V',
        )
        self._login('val_warna@example.com', 'Pass12345!')
        response = self.client.post(
            self.url_mk,
            {'nama': 'MK Warna', 'warna': 'not-hex'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('warna', response.data['errors'])

    def test_create_mata_kuliah_rejects_duplicate_nama(self):
        user = User.objects.create_user(
            email='val_dup@example.com', password='Pass12345!', nama_lengkap='V',
        )
        MataKuliah.objects.create(user=user, nama='Duplikat', warna='#AABBCC')
        self._login('val_dup@example.com', 'Pass12345!')
        response = self.client.post(
            self.url_mk,
            {'nama': 'duplikat', 'warna': '#112233'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('nama', response.data['errors'])
