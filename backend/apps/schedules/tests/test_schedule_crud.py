"""
Schedule CRUD, ownership, and validation tests.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User
from apps.common.test_utils import AuthTestMixin
from apps.schedules.models import JadwalKuliah


class ScheduleCRUDAPITestCase(AuthTestMixin, APITestCase):
    def setUp(self):
        self.url_list = reverse('jadwal-list')

    def _schedule_detail_url(self, jadwal):
        return reverse('jadwal-detail', kwargs={'pk': str(jadwal.id)})

    def _valid_payload(self, **overrides):
        payload = {
            'hari': 'senin',
            'jam': '08:00-10:00',
            'ruangan': 'A101',
            'dosen': 'Dr. Test',
            'mata_kuliah': 'Matematika',
        }
        payload.update(overrides)
        return payload

    def test_create_schedule_authenticated(self):
        User.objects.create_user(
            email='sched_ok@example.com',
            password='Pass12345!',
            nama_lengkap='Scheduler',
        )
        self._login('sched_ok@example.com', 'Pass12345!')
        response = self.client.post(self.url_list, self._valid_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['mata_kuliah'], 'Matematika')

    def test_unauthenticated_create_rejected(self):
        response = self.client.post(self.url_list, self._valid_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_list_only_returns_own_schedules(self):
        alice = User.objects.create_user(
            email='sched_alice@example.com', password='Pass12345!', nama_lengkap='A',
        )
        bob = User.objects.create_user(
            email='sched_bob@example.com', password='Pass12345!', nama_lengkap='B',
        )
        JadwalKuliah.objects.create(user=alice, **self._valid_payload(mata_kuliah='Alice MK'))
        JadwalKuliah.objects.create(user=bob, **self._valid_payload(mata_kuliah='Bob MK'))

        self._login('sched_alice@example.com', 'Pass12345!')
        response = self.client.get(self.url_list)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['mata_kuliah'], 'Alice MK')

    def test_other_user_cannot_delete_schedule(self):
        owner = User.objects.create_user(
            email='sched_owner@example.com', password='Pass12345!', nama_lengkap='O',
        )
        intruder = User.objects.create_user(
            email='sched_intruder@example.com', password='Pass12345!', nama_lengkap='I',
        )
        jadwal = JadwalKuliah.objects.create(user=owner, **self._valid_payload())

        self._login('sched_intruder@example.com', 'Pass12345!')
        response = self.client.delete(self._schedule_detail_url(jadwal))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertTrue(JadwalKuliah.objects.filter(pk=jadwal.pk).exists())

    def test_create_rejects_invalid_jam_format(self):
        User.objects.create_user(
            email='sched_val@example.com', password='Pass12345!', nama_lengkap='V',
        )
        self._login('sched_val@example.com', 'Pass12345!')
        response = self.client.post(
            self.url_list,
            self._valid_payload(jam='invalid'),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(response.data['success'])
        self.assertIn('jam', response.data['errors'])
