from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from scanner.models import FileScan

User = get_user_model()

class SecurityHealthCardViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='healthuser',
            email='health@example.com',
            password='SecureShield@2026',
            is_verified=True
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        self.health_card_url = reverse('security_health_card')

    def test_get_security_health_card_clean_user(self):
        response = self.client.get(self.health_card_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('security_score', response.data)
        self.assertIn('files_scanned', response.data)
        self.assertIn('threats_prevented', response.data)
        self.assertIn('most_common_threat', response.data)
        self.assertIn('last_scan', response.data)
        self.assertIn('recommendations', response.data)
        self.assertIn('monthly_progress', response.data)
        
        # Fresh user should have 100 score, 0 scans, 0 threats
        self.assertEqual(response.data['security_score'], 100)
        self.assertEqual(response.data['files_scanned'], 0)
        self.assertEqual(response.data['threats_prevented'], 0)
        self.assertEqual(response.data['most_common_threat'], "None")

    def test_get_security_health_card_with_scans(self):
        # Create a clean scan
        FileScan.objects.create(
            user=self.user,
            file_name="clean_doc.pdf",
            file_hash="a"*64,
            file_size=1024,
            extension="pdf",
            risk_score=0,
            status="CLEAN"
        )
        
        # Create a malicious scan
        FileScan.objects.create(
            user=self.user,
            file_name="virus.exe",
            file_hash="b"*64,
            file_size=2048,
            extension="exe",
            risk_score=100,
            status="MALICIOUS",
            malware_family="Packed.Generic"
        )
        
        response = self.client.get(self.health_card_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['files_scanned'], 2)
        self.assertEqual(response.data['threats_prevented'], 1)
        self.assertEqual(response.data['most_common_threat'], "Packed.Generic")
        
        # Score deductions: 1 unresolved threat * 15 = 15 deduction
        # Bonuses: 1 clean scan * 2 = +2 bonus
        # Recent activity: +5 bonus
        # Total: 100 - 15 + 2 + 5 = 92
        self.assertEqual(response.data['security_score'], 92)
