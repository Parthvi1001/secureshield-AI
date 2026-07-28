from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class FileScannerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='scanuser',
            email='scan@example.com',
            password='SecureShield@2026',
            is_verified=True
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        self.upload_url = reverse('file_upload')

    def test_upload_clean_pdf(self):
        # Create a mock PDF file with correct magic bytes %PDF
        clean_pdf = SimpleUploadedFile(
            "clean.pdf",
            b"%PDF-1.4\n" + b"this is a clean mock pdf file content padding payload to exceed one hundred bytes size requirement in scanners " * 3,
            content_type="application/pdf"
        )
        response = self.client.post(self.upload_url, {'file': clean_pdf}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['classification'], 'SAFE')
        self.assertEqual(response.data['risk_score'], 0)

    def test_upload_unsupported_file_extension(self):
        txt_file = SimpleUploadedFile(
            "text.txt",
            b"unsupported text file content",
            content_type="text/plain"
        )
        response = self.client.post(self.upload_url, {'file': txt_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_upload_spoofed_exe_magic_bytes(self):
        # Uploading an exe file that does not start with MZ magic bytes should trigger extension spoofing penalty
        fake_exe = SimpleUploadedFile(
            "spoofed.exe",
            b"not_MZ_magic_bytes_payload",
            content_type="application/x-msdownload"
        )
        response = self.client.post(self.upload_url, {'file': fake_exe}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['classification'], 'SUSPICIOUS')
        self.assertTrue(response.data['risk_score'] >= 40)
