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

    def test_clean_pdf_with_js(self):
        # Create a mock PDF file with JS tokens (should be marked suspicious due to entropy or metadata)
        # In our logic, let's trigger a mismatch or spoofing or EICAR, or just upload a zip/exe that is suspicious,
        # then clean it. Since we can upload any pdf, let's create one with /JS and /OpenAction
        dirty_pdf = SimpleUploadedFile(
            "dangerous.pdf",
            b"%PDF-1.4\n" + b"/JS /JavaScript /OpenAction /AA " * 10,
            content_type="application/pdf"
        )
        
        # Upload
        upload_resp = self.client.post(self.upload_url, {'file': dirty_pdf}, format='multipart')
        self.assertEqual(upload_resp.status_code, status.HTTP_201_CREATED)
        scan_id = upload_resp.data['id']
        
        # Clean
        clean_url = reverse('file_clean')
        dirty_pdf.seek(0)
        clean_resp = self.client.post(clean_url, {'file': dirty_pdf, 'scan_id': scan_id}, format='multipart')
        
        self.assertEqual(clean_resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(clean_resp.data['threats_removed'] > 0)
        self.assertTrue(clean_resp.data['javascript_removed'])
        self.assertEqual(clean_resp.data['status'], 'Cleaned')
        self.assertIn('download_url', clean_resp.data)

    def test_clean_invalid_scan_id(self):
        clean_url = reverse('file_clean')
        dummy_file = SimpleUploadedFile("test.pdf", b"%PDF-1.4\ncontent", content_type="application/pdf")
        clean_resp = self.client.post(clean_url, {'file': dummy_file, 'scan_id': 9999}, format='multipart')
        self.assertEqual(clean_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_scan_cleaned_file_is_safe(self):
        dirty_pdf = SimpleUploadedFile(
            "dangerous.pdf",
            b"%PDF-1.4\n" + b"/JS /JavaScript /OpenAction /AA " * 10,
            content_type="application/pdf"
        )
        upload_resp = self.client.post(self.upload_url, {'file': dirty_pdf}, format='multipart')
        self.assertEqual(upload_resp.status_code, status.HTTP_201_CREATED)
        scan_id = upload_resp.data['id']
        
        clean_url = reverse('file_clean')
        dirty_pdf.seek(0)
        clean_resp = self.client.post(clean_url, {'file': dirty_pdf, 'scan_id': scan_id}, format='multipart')
        self.assertEqual(clean_resp.status_code, status.HTTP_201_CREATED)
        
        from scanner.models import CleanedFile
        cleaned_rec = CleanedFile.objects.get(id=clean_resp.data['id'])
        cleaned_content = cleaned_rec.cleaned_file.read()
        
        cleaned_upload_file = SimpleUploadedFile(
            "cleaned_file.pdf",
            cleaned_content,
            content_type="application/pdf"
        )
        
        re_scan_resp = self.client.post(self.upload_url, {'file': cleaned_upload_file}, format='multipart')
        
        self.assertEqual(re_scan_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(re_scan_resp.data['classification'], 'SAFE')
        self.assertEqual(re_scan_resp.data['risk_score'], 0)


