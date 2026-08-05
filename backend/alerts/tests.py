from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from alerts.models import SecurityAlert

User = get_user_model()

class SecurityAlertsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='alertuser',
            email='alertuser@example.com',
            password='SecurePassword123!',
            is_verified=True
        )
        self.client.force_authenticate(user=self.user)
        
        # Create security alerts
        self.alert1 = SecurityAlert.objects.create(
            user=self.user,
            severity='HIGH',
            title='Suspicious Scan Detected',
            description='EICAR test file uploaded.'
        )
        self.alert2 = SecurityAlert.objects.create(
            user=self.user,
            severity='LOW',
            title='Minor Alert',
            description='Test alert details.'
        )
        self.resolved_alert = SecurityAlert.objects.create(
            user=self.user,
            severity='MEDIUM',
            title='Resolved Alert',
            description='Details of resolved alert.',
            is_resolved=True
        )
        
        self.list_url = reverse('alert-list')

    def test_list_unresolved_alerts(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return unresolved alerts (alert1 and alert2)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['title'], 'Minor Alert') # Newest first

    def test_resolve_alert_successfully(self):
        resolve_url = reverse('alert-resolve', kwargs={'pk': self.alert1.id})
        response = self.client.post(resolve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Alert acknowledged successfully.')
        
        self.alert1.refresh_from_db()
        self.assertTrue(self.alert1.is_resolved)
        
        # Listing again should only return alert2 now
        list_resp = self.client.get(self.list_url)
        self.assertEqual(len(list_resp.data), 1)

    def test_resolve_unauthorized_alert(self):
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='SecurePassword123!'
        )
        other_alert = SecurityAlert.objects.create(
            user=other_user,
            severity='HIGH',
            title='Other User Alert',
            description='Confidential alert.'
        )
        
        resolve_url = reverse('alert-resolve', kwargs={'pk': other_alert.id})
        response = self.client.post(resolve_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
