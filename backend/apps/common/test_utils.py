"""
Shared helpers for API tests.
"""
from django.urls import reverse
from rest_framework import status


class AuthTestMixin:
    """Login via /api/auth/login/ and attach Bearer token to the test client."""

    def _login(self, email, password):
        response = self.client.post(
            reverse('auth-login'),
            {'email': email, 'password': password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=response.data)
        access = response.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        return response

    def _clear_auth(self):
        self.client.credentials()
