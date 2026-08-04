from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from scanner.models import FileScan

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
        
        # Create some mock FileScan records
        FileScan.objects.create(
            user=self.user,
            file_name='secure_contract.pdf',
            file_hash='a' * 64,
            file_size=1024,
            extension='pdf',
            risk_score=10,
            status='CLEAN'
        )
        FileScan.objects.create(
            user=self.user,
            file_name='ransomware_payload.exe',
            file_hash='b' * 64,
            file_size=2048,
            extension='exe',
            risk_score=90,
            status='MALICIOUS'
        )

    def test_get_history_list(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        # Chronological order - newest first
        self.assertEqual(response.data['results'][0]['file_name'], 'ransomware_payload.exe')

    def test_filter_history_by_success(self):
        # Filter by SAFE/CLEAN status
        response = self.client.get(self.history_url, {'status': 'clean'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['file_name'], 'secure_contract.pdf')

    def test_get_stats_aggregates(self):
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_logins'], 2)
        self.assertEqual(response.data['status_distribution']['success'], 1) # SAFE
        self.assertEqual(response.data['status_distribution']['failed'], 1) # MALICIOUS

    def test_export_csv_endpoint(self):
        response = self.client.get(self.history_url, {'export': 'csv'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename="scanned_files_history.csv"', response['Content-Disposition'])
