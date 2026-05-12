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
        self.url_logout = reverse('auth-logout')
        self.url_token_refresh = reverse('token-refresh')
        self.url_profile = reverse('auth-profile')
        self.url_change_password = reverse('auth-change-password')

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

    def test_register_umum_duplicate_email_rejected(self):
        """Second signup with the same email must fail (case-insensitive duplicate)."""
        payload = {
            'nama_lengkap': 'User Satu',
            'email': 'duplicate@example.com',
            'password': 'SecurePass123!',
        }
        first = self.client.post(self.url_register_umum, payload, format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            self.url_register_umum,
            {**payload, 'nama_lengkap': 'User Dua'},
            format='json',
        )
        self.assertEqual(second.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(second.data['success'])
        self.assertIn('email', second.data['errors'])

        # Same local-part with different casing should still be treated as duplicate
        third = self.client.post(
            self.url_register_umum,
            {
                'nama_lengkap': 'User Tiga',
                'email': 'DUPLICATE@EXAMPLE.COM',
                'password': 'AnotherPass123!',
            },
            format='json',
        )
        self.assertEqual(third.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertFalse(third.data['success'])

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

    # ── Logout (blacklist) ────────────────────────────────────────────────────

    def test_logout_missing_refresh_returns_bad_request(self):
        """Logout without a refresh body must fail before blacklist logic."""
        user = User.objects.create_user(
            email='logout_norefresh@example.com',
            password='LogoutPass123!',
            nama_lengkap='No Refresh User',
        )
        login = self.client.post(
            self.url_login,
            {'email': user.email, 'password': 'LogoutPass123!'},
            format='json',
        )
        access = login.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        response = self.client.post(self.url_logout, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('Refresh token diperlukan', response.data['message'])

    def test_logout_blacklists_refresh_so_refresh_fails(self):
        """
        After authenticated logout with a valid refresh token, that refresh
        must no longer obtain a new access token (blacklist integration).
        """
        reg = self.client.post(
            self.url_register_umum,
            {
                'nama_lengkap': 'Logout User',
                'email': 'logout_blacklist@example.com',
                'password': 'SecurePass123!',
            },
            format='json',
        )
        self.assertEqual(reg.status_code, status.HTTP_201_CREATED)
        access = reg.data['data']['tokens']['access']
        refresh = reg.data['data']['tokens']['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        logout = self.client.post(self.url_logout, {'refresh': refresh}, format='json')
        self.assertEqual(logout.status_code, status.HTTP_200_OK)
        self.assertTrue(logout.data['success'])

        # Refresh endpoint is public; must not accept the blacklisted refresh
        self.client.credentials()
        blocked = self.client.post(
            self.url_token_refresh,
            {'refresh': refresh},
            format='json',
        )
        self.assertFalse(blocked.data['success'])
        self.assertIn(
            blocked.status_code,
            (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED),
        )

    # ── Protected route (JWT) ───────────────────────────────────────────────

    def test_profile_requires_authentication(self):
        response = self.client.get(self.url_profile)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_rejects_malformed_bearer_token(self):
        """Invalid JWT string in Authorization header must not return 200."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer not-a-valid-jwt')
        response = self.client.get(self.url_profile)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_rejects_structurally_invalid_jwt(self):
        """Three dot-separated segments that are not a real signed token → 401."""
        fake_jwt = (
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJzdWIiOiIxIn0.'
            'not-a-real-signature'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {fake_jwt}')
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

    def test_profile_patch_updates_nama_lengkap(self):
        """PATCH may update writable fields; read-only fields stay unchanged in DB."""
        user = User.objects.create_user(
            email='patch_test@example.com',
            password='PatchPass123!',
            nama_lengkap='Nama Lama',
        )
        login = self.client.post(
            self.url_login,
            {'email': user.email, 'password': 'PatchPass123!'},
            format='json',
        )
        access = login.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        response = self.client.patch(
            self.url_profile,
            {'nama_lengkap': 'Nama Baru'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['nama_lengkap'], 'Nama Baru')
        self.assertEqual(response.data['data']['email'], user.email)

        user.refresh_from_db()
        self.assertEqual(user.nama_lengkap, 'Nama Baru')

    # ── Change password ─────────────────────────────────────────────────────

    def test_change_password_success(self):
        """
        Authenticated user can set a new password; DB hash updates.
        Access tokens are not revoked by this endpoint (documented product behavior).
        """
        user = User.objects.create_user(
            email='chpwd_ok@example.com',
            password='OldPass123!',
            nama_lengkap='Change Ok',
        )
        login = self.client.post(
            self.url_login,
            {'email': user.email, 'password': 'OldPass123!'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["data"]["access"]}')

        response = self.client.post(
            self.url_change_password,
            {
                'password_lama': 'OldPass123!',
                'password_baru': 'NewPass456!',
                'password_baru_confirm': 'NewPass456!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('Password berhasil diubah', response.data['message'])

        user.refresh_from_db()
        self.assertTrue(user.check_password('NewPass456!'))
        self.assertFalse(user.check_password('OldPass123!'))

    def test_change_password_wrong_old_password_rejected(self):
        """Wrong current password must not change the stored hash."""
        user = User.objects.create_user(
            email='chpwd_bad@example.com',
            password='CorrectOld123!',
            nama_lengkap='Change Bad',
        )
        login = self.client.post(
            self.url_login,
            {'email': user.email, 'password': 'CorrectOld123!'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["data"]["access"]}')

        response = self.client.post(
            self.url_change_password,
            {
                'password_lama': 'DefinitelyWrongOld!',
                'password_baru': 'NewPass789!',
                'password_baru_confirm': 'NewPass789!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('password_lama', response.data['errors'])

        user.refresh_from_db()
        self.assertTrue(user.check_password('CorrectOld123!'))
        self.assertFalse(user.check_password('NewPass789!'))
