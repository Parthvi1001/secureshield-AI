from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='profileuser',
            email='profile@example.com',
            password='SecureShield@2026',
            is_verified=True
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.profile_url = reverse('user_profile')
        self.change_password_url = reverse('change_password')
        self.delete_account_url = reverse('delete_account')

    def test_get_profile(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['username'], self.user.username)
        self.assertIn('security_score', response.data)

    def test_update_profile(self):
        update_data = {
            'mobile': '+1234567890',
            'country': 'Canada' # Read-only, should be ignored
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mobile'], update_data['mobile'])
        # Country should remain the default (None/blank) because it is read-only
        self.assertNotEqual(response.data['country'], update_data['country'])
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.mobile, update_data['mobile'])

    def test_change_password(self):
        password_data = {
            'old_password': 'SecureShield@2026',
            'new_password': 'NewSecureShield@2026'
        }
        response = self.client.post(self.change_password_url, password_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Password changed successfully.")
        
        # Verify old password no longer works
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password('SecureShield@2026'))
        self.assertTrue(self.user.check_password('NewSecureShield@2026'))

    def test_delete_account(self):
        response = self.client.delete(self.delete_account_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Operative clearance revoked. Account successfully deleted.")
        
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(username='profileuser')
