"""
Authentication boundary and standardized error envelope tests.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import User


class AuthPermissionAPITestCase(APITestCase):
    def setUp(self):
        self.url_profile = reverse('auth-profile')
        self.url_tasks = reverse('task-list')

    def test_unauthenticated_profile_returns_envelope(self):
        response = self.client.get(self.url_profile)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
        self.assertIn('message', response.data)

    def test_unauthenticated_task_list_returns_envelope(self):
        response = self.client.get(self.url_tasks)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_inactive_user_cannot_login(self):
        User.objects.create_user(
            email='inactive@example.com',
            password='InactivePass123!',
            nama_lengkap='Inactive',
            is_active=False,
        )
        response = self.client.post(
            reverse('auth-login'),
            {'email': 'inactive@example.com', 'password': 'InactivePass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
