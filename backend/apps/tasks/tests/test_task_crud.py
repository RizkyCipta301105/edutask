"""
Task CRUD security, ownership, and validation tests.

Run:
    cd backend && python manage.py test apps.tasks.tests \\
        --settings=config.settings_test

Response envelope (tasks app): success, message, data | errors
"""
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User
from apps.tasks.models import MataKuliah, Task


class TaskCRUDSecurityAPITestCase(APITestCase):
    """Task API ownership, JWT boundary, and serializer rules."""

    def setUp(self):
        self.url_tasks = reverse('task-list')
        self.url_kanban = reverse('kanban-board')

    def _login(self, email, password):
        r = self.client.post(
            reverse('auth-login'),
            {'email': email, 'password': password},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK, msg=r.data)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["data"]["access"]}')

    def _clear_auth(self):
        self.client.credentials()

    def _task_detail_url(self, task):
        return reverse('task-detail', kwargs={'pk': str(task.id)})

    # ── 1. Authenticated task creation ──────────────────────────────────────

    def test_authenticated_task_creation(self):
        User.objects.create_user(
            email='create_ok@example.com',
            password='Pass12345!',
            nama_lengkap='Creator',
        )
        self._login('create_ok@example.com', 'Pass12345!')
        deadline = (timezone.now().date() + timedelta(days=3)).isoformat()
        payload = {
            'judul': 'Tugas Autentikasi',
            'deskripsi': '',
            'deadline': deadline,
            'prioritas': 'sedang',
            'status': 'todo',
        }
        r = self.client.post(self.url_tasks, payload, format='json')

        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(r.data['success'])
        self.assertEqual(r.data['data']['judul'], 'Tugas Autentikasi')
        self.assertEqual(r.data['data']['status'], 'todo')
        self.assertTrue(
            Task.objects.filter(
                judul='Tugas Autentikasi',
                user__email='create_ok@example.com',
            ).exists()
        )

    # ── 2. Unauthenticated rejection ────────────────────────────────────────

    def test_unauthenticated_task_creation_rejected(self):
        self._clear_auth()
        deadline = (timezone.now().date() + timedelta(days=1)).isoformat()
        r = self.client.post(
            self.url_tasks,
            {'judul': 'X', 'deadline': deadline, 'prioritas': 'rendah'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── 3. List only own tasks ─────────────────────────────────────────────

    def test_user_sees_only_own_tasks_in_list(self):
        alice = User.objects.create_user(
            email='alice_list@example.com', password='Pass12345!', nama_lengkap='Alice'
        )
        bob = User.objects.create_user(
            email='bob_list@example.com', password='Pass12345!', nama_lengkap='Bob'
        )
        d = timezone.now().date() + timedelta(days=5)
        Task.objects.create(
            user=alice, judul='Alice A', deadline=d, prioritas=Task.Prioritas.SEDANG
        )
        Task.objects.create(
            user=alice, judul='Alice B', deadline=d, prioritas=Task.Prioritas.RENDAH
        )
        Task.objects.create(
            user=bob, judul='Bob secret', deadline=d, prioritas=Task.Prioritas.TINGGI
        )

        self._login('alice_list@example.com', 'Pass12345!')
        r = self.client.get(self.url_tasks)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data['success'])
        juduls = {t['judul'] for t in r.data['data']}
        self.assertEqual(len(r.data['data']), 2)
        self.assertIn('Alice A', juduls)
        self.assertIn('Alice B', juduls)
        self.assertNotIn('Bob secret', juduls)

    # ── 4–6. Cross-user detail / update / delete → 404 ───────────────────────

    def test_user_cannot_access_another_users_task_detail(self):
        alice = User.objects.create_user(
            email='alice_detail@example.com', password='Pass12345!', nama_lengkap='A'
        )
        bob = User.objects.create_user(
            email='bob_detail@example.com', password='Pass12345!', nama_lengkap='B'
        )
        t = Task.objects.create(
            user=alice,
            judul='Alice private',
            deadline=timezone.now().date() + timedelta(days=2),
            prioritas=Task.Prioritas.SEDANG,
        )
        self._login('bob_detail@example.com', 'Pass12345!')
        r = self.client.get(self._task_detail_url(t))
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_another_users_task(self):
        alice = User.objects.create_user(
            email='alice_put@example.com', password='Pass12345!', nama_lengkap='A'
        )
        bob = User.objects.create_user(
            email='bob_put@example.com', password='Pass12345!', nama_lengkap='B'
        )
        t = Task.objects.create(
            user=alice,
            judul='No hijack',
            deadline=timezone.now().date() + timedelta(days=2),
            prioritas=Task.Prioritas.SEDANG,
        )
        self._login('bob_put@example.com', 'Pass12345!')
        r = self.client.put(
            self._task_detail_url(t),
            {'judul': 'Hijacked'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
        t.refresh_from_db()
        self.assertEqual(t.judul, 'No hijack')

    def test_user_cannot_delete_another_users_task(self):
        alice = User.objects.create_user(
            email='alice_del@example.com', password='Pass12345!', nama_lengkap='A'
        )
        bob = User.objects.create_user(
            email='bob_del@example.com', password='Pass12345!', nama_lengkap='B'
        )
        t = Task.objects.create(
            user=alice,
            judul='Protected',
            deadline=timezone.now().date() + timedelta(days=2),
            prioritas=Task.Prioritas.SEDANG,
        )
        self._login('bob_del@example.com', 'Pass12345!')
        r = self.client.delete(self._task_detail_url(t))
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Task.objects.filter(pk=t.pk).exists())

    # ── 7. Deadline on create ───────────────────────────────────────────────

    def test_deadline_validation_on_create_rejects_past_date(self):
        User.objects.create_user(
            email='deadline_create@example.com', password='Pass12345!', nama_lengkap='D'
        )
        self._login('deadline_create@example.com', 'Pass12345!')
        past = (timezone.now().date() - timedelta(days=2)).isoformat()
        r = self.client.post(
            self.url_tasks,
            {
                'judul': 'Past task',
                'deadline': past,
                'prioritas': 'sedang',
                'status': 'todo',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(r.data['success'])
        self.assertIn('deadline', r.data['errors'])

    # ── 8. Update deadline into past (allowed today — serializer quirk) ────

    def test_update_task_deadline_into_past_allowed(self):
        """
        TaskSerializer.validate_deadline only enforces 'not in past' when
        self.instance is None (create path). On update, instance is set, so
        past deadlines are accepted — documents validation inconsistency vs
        TaskCreateSerializer / create behavior.
        """
        u = User.objects.create_user(
            email='deadline_update@example.com', password='Pass12345!', nama_lengkap='U'
        )
        future = timezone.now().date() + timedelta(days=10)
        past = timezone.now().date() - timedelta(days=1)
        t = Task.objects.create(
            user=u,
            judul='Move deadline',
            deadline=future,
            prioritas=Task.Prioritas.SEDANG,
        )
        self._login('deadline_update@example.com', 'Pass12345!')
        r = self.client.patch(
            self._task_detail_url(t),
            {'deadline': past.isoformat()},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data['success'])
        t.refresh_from_db()
        self.assertEqual(t.deadline, past)

    # ── 9. Mata kuliah ownership ────────────────────────────────────────────

    def test_create_task_rejects_other_users_mata_kuliah(self):
        alice = User.objects.create_user(
            email='mk_alice@example.com', password='Pass12345!', nama_lengkap='A'
        )
        bob = User.objects.create_user(
            email='mk_bob@example.com', password='Pass12345!', nama_lengkap='B'
        )
        mk = MataKuliah.objects.create(user=alice, nama='Kalkulus', warna='#000000')
        d = (timezone.now().date() + timedelta(days=4)).isoformat()

        self._login('mk_bob@example.com', 'Pass12345!')
        r = self.client.post(
            self.url_tasks,
            {
                'judul': 'Steal MK',
                'deadline': d,
                'prioritas': 'tinggi',
                'status': 'todo',
                'mata_kuliah': str(mk.id),
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(r.data['success'])
        self.assertIn('mata_kuliah', r.data['errors'])

    # ── 10. List filtering ──────────────────────────────────────────────────

    def test_task_list_filtering_behavior(self):
        u = User.objects.create_user(
            email='filter_user@example.com', password='Pass12345!', nama_lengkap='F'
        )
        d = timezone.now().date() + timedelta(days=7)
        mk = MataKuliah.objects.create(user=u, nama='FilterMK', warna='#111111')
        Task.objects.create(
            user=u,
            judul='AlphaTodoTinggi',
            deadline=d,
            prioritas=Task.Prioritas.TINGGI,
            status=Task.Status.TODO,
        )
        Task.objects.create(
            user=u,
            judul='BetaDoneSedang',
            deadline=d,
            prioritas=Task.Prioritas.SEDANG,
            status=Task.Status.DONE,
            mata_kuliah=mk,
        )

        self._login('filter_user@example.com', 'Pass12345!')

        r_status = self.client.get(self.url_tasks, {'status': 'todo'})
        self.assertEqual(len(r_status.data['data']), 1)
        self.assertEqual(r_status.data['data'][0]['judul'], 'AlphaTodoTinggi')

        r_pri = self.client.get(self.url_tasks, {'prioritas': 'sedang'})
        self.assertEqual(len(r_pri.data['data']), 1)
        self.assertEqual(r_pri.data['data'][0]['judul'], 'BetaDoneSedang')

        r_mk = self.client.get(self.url_tasks, {'mata_kuliah': str(mk.id)})
        self.assertEqual(len(r_mk.data['data']), 1)
        self.assertEqual(r_mk.data['data'][0]['judul'], 'BetaDoneSedang')

        r_search = self.client.get(self.url_tasks, {'search': 'Alpha'})
        self.assertEqual(len(r_search.data['data']), 1)
        self.assertIn('Alpha', r_search.data['data'][0]['judul'])

    # ── 11. Malformed JWT on task endpoints ─────────────────────────────────

    def test_task_list_rejects_malformed_jwt(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer not-a-jwt')
        r = self.client.get(self.url_tasks)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_task_kanban_rejects_malformed_jwt(self):
        fake = (
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJzdWIiOiIxIn0.'
            'not-a-real-signature'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {fake}')
        r = self.client.get(self.url_kanban)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── 12. Partial PATCH ───────────────────────────────────────────────────

    def test_partial_patch_updates_single_field(self):
        u = User.objects.create_user(
            email='patch_task@example.com', password='Pass12345!', nama_lengkap='P'
        )
        d = timezone.now().date() + timedelta(days=6)
        t = Task.objects.create(
            user=u,
            judul='Original judul',
            deskripsi='Keep me',
            deadline=d,
            prioritas=Task.Prioritas.RENDAH,
            status=Task.Status.TODO,
        )
        self._login('patch_task@example.com', 'Pass12345!')
        r = self.client.patch(
            self._task_detail_url(t),
            {'judul': 'Updated judul only'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data['success'])
        self.assertEqual(r.data['data']['judul'], 'Updated judul only')
        self.assertEqual(r.data['data']['deskripsi'], 'Keep me')
        self.assertEqual(r.data['data']['prioritas'], 'rendah')
        t.refresh_from_db()
        self.assertEqual(t.judul, 'Updated judul only')
        self.assertEqual(t.deskripsi, 'Keep me')
