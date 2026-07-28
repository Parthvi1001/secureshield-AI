from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from history.models import LoginHistory

User = get_user_model()

class HistoryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='historyuser',
            email='history@example.com',
            password='SecureShield@2026',
            is_verified=True
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.history_url = reverse('login_history_list')
        self.stats_url = reverse('login_history_stats')
        
        # Create some mock LoginHistory records
        LoginHistory.objects.create(
            user=self.user,
            ip_address='192.168.1.1',
            country='Canada',
            browser='Chrome',
            device='Desktop',
            threat_score=0.1,
            is_success=True
        )
        LoginHistory.objects.create(
            user=self.user,
            ip_address='10.0.0.1',
            country='Germany',
            browser='Firefox',
            device='Mobile',
            threat_score=0.6,
            is_success=False
        )

    def test_get_history_list(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['results'][0]['ip_address'], '10.0.0.1') # Ordered by -created_at

    def test_filter_history_by_success(self):
        response = self.client.get(self.history_url, {'status': 'success'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['ip_address'], '192.168.1.1')

    def test_get_stats_aggregates(self):
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_logins'], 2)
        self.assertEqual(response.data['status_distribution']['success'], 1)
        self.assertEqual(response.data['status_distribution']['failed'], 1)
        self.assertIn('timeline', response.data)

    def test_export_csv_endpoint(self):
        response = self.client.get(self.history_url, {'export': 'csv'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename="login_history.csv"', response['Content-Disposition'])
