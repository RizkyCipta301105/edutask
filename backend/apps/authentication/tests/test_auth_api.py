"""
Authentication API tests — register, login, JWT refresh, protected access.

Run:
    cd backend && python manage.py test apps.authentication.tests \\
        --settings=config.settings_test
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User


class AuthEndpointsAPITestCase(APITestCase):
    """Covers /api/auth/ flows used by the React client."""

    def setUp(self):
        self.url_register_umum = reverse('auth-register-umum-slash')
        self.url_login = reverse('auth-login')
        self.url_token_refresh = reverse('token-refresh')
        self.url_profile = reverse('auth-profile')

    # ── Register (role: umum) ───────────────────────────────────────────────

    def test_register_umum_success(self):
        payload = {
            'nama_lengkap': 'Pengguna Uji',
            'email': 'umum_test@example.com',
            'password': 'SecurePass123!',
        }
        response = self.client.post(self.url_register_umum, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'], msg=response.data)
        self.assertIn('data', response.data)
        data = response.data['data']
        self.assertIn('user', data)
        self.assertIn('tokens', data)
        self.assertIn('access', data['tokens'])
        self.assertIn('refresh', data['tokens'])
        self.assertEqual(data['user']['email'], 'umum_test@example.com')
        self.assertTrue(User.objects.filter(email='umum_test@example.com').exists())

    def test_register_umum_validation_error(self):
        response = self.client.post(
            self.url_register_umum,
            {'nama_lengkap': 'X', 'email': 'not-an-email', 'password': 'short'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(response.data['success'])
        self.assertIn('errors', response.data)

    # ── Login ───────────────────────────────────────────────────────────────

    def test_login_success(self):
        User.objects.create_user(
            email='login_test@example.com',
            password='LoginPass123!',
            nama_lengkap='Login User',
        )
        response = self.client.post(
            self.url_login,
            {'email': 'login_test@example.com', 'password': 'LoginPass123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        body = response.data['data']
        self.assertIn('access', body)
        self.assertIn('refresh', body)
        self.assertIn('user', body)
        self.assertEqual(body['user']['email'], 'login_test@example.com')

    def test_login_invalid_credentials(self):
        User.objects.create_user(
            email='onlyuser@example.com',
            password='CorrectHorse123!',
            nama_lengkap='U',
        )
        response = self.client.post(
            self.url_login,
            {'email': 'onlyuser@example.com', 'password': 'WrongPassword!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    # ── Token refresh ───────────────────────────────────────────────────────

    def test_token_refresh_success(self):
        User.objects.create_user(
            email='refresh_test@example.com',
            password='RefreshPass123!',
            nama_lengkap='Refresh User',
        )
        login = self.client.post(
            self.url_login,
            {'email': 'refresh_test@example.com', 'password': 'RefreshPass123!'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        refresh = login.data['data']['refresh']

        response = self.client.post(
            self.url_token_refresh,
            {'refresh': refresh},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        payload = response.data['data']
        self.assertIn('access', payload)

    def test_token_refresh_invalid_token(self):
        response = self.client.post(
            self.url_token_refresh,
            {'refresh': 'definitely-not-a-jwt'},
            format='json',
        )

        self.assertIn(
            response.status_code,
            (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED),
        )
        self.assertFalse(response.data['success'])

    # ── Protected route (JWT) ───────────────────────────────────────────────

    def test_profile_requires_authentication(self):
        response = self.client.get(self.url_profile)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_with_valid_access_token(self):
        user = User.objects.create_user(
            email='profile_test@example.com',
            password='ProfilePass123!',
            nama_lengkap='Profile User',
        )
        login = self.client.post(
            self.url_login,
            {'email': user.email, 'password': 'ProfilePass123!'},
            format='json',
        )
        access = login.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        response = self.client.get(self.url_profile)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['email'], user.email)
