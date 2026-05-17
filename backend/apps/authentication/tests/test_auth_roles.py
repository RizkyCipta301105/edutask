"""
Role registration and JWT claim tests.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from apps.authentication.models import User


class AuthRoleAPITestCase(APITestCase):
    def test_register_umum_assigns_umum_role(self):
        response = self.client.post(
            reverse('auth-register-umum-slash'),
            {
                'nama_lengkap': 'User Umum',
                'email': 'umum_role@example.com',
                'password': 'SecurePass123!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='umum_role@example.com')
        self.assertEqual(user.role, User.Role.UMUM)
        self.assertEqual(response.data['data']['user']['role'], User.Role.UMUM)

    def test_register_mahasiswa_assigns_mahasiswa_role(self):
        response = self.client.post(
            reverse('auth-register-mahasiswa-slash'),
            {
                'nama_lengkap': 'Mhs Role',
                'nrp': '20240001',
                'email': 'mhs_role@student.pens.ac.id',
                'password': 'SecurePass123!',
                'prodi': 'Teknik Informatika',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='mhs_role@student.pens.ac.id')
        self.assertEqual(user.role, User.Role.MAHASISWA)

        access = response.data['data']['tokens']['access']
        token = AccessToken(access)
        self.assertEqual(token['role'], User.Role.MAHASISWA)
        self.assertEqual(token['email'], user.email)

    def test_register_dosen_assigns_dosen_role(self):
        response = self.client.post(
            reverse('auth-register-dosen-slash'),
            {
                'nama_lengkap': 'Dosen Role',
                'nip': '1987654321',
                'email': 'dosen_role@pens.ac.id',
                'mata_kuliah': 'Algoritma',
                'password': 'SecurePass123!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='dosen_role@pens.ac.id')
        self.assertEqual(user.role, User.Role.DOSEN)

    def test_login_access_token_includes_role_claim(self):
        User.objects.create_user(
            email='claims@example.com',
            password='ClaimsPass123!',
            nama_lengkap='Claims User',
            role=User.Role.UMUM,
        )
        response = self.client.post(
            reverse('auth-login'),
            {'email': 'claims@example.com', 'password': 'ClaimsPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = AccessToken(response.data['data']['access'])
        self.assertEqual(token['role'], User.Role.UMUM)
        self.assertEqual(token['email'], 'claims@example.com')
