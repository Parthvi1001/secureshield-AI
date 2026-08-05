from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import OTP

User = get_user_model()

class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.send_otp_url = reverse('register_send_otp')
        self.verify_otp_url = reverse('register_verify_otp')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'SecureShield@2026'
        }

    def test_signup_flow(self):
        # 1. Send pre-registration OTP
        send_resp = self.client.post(self.send_otp_url, {'email': self.user_data['email']}, format='json')
        self.assertEqual(send_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(send_resp.data['message'], "OTP has been sent successfully. Please check your Inbox or Spam folder.")

        # Verify pre-registration OTP created in database
        otp_record = OTP.objects.filter(email=self.user_data['email'], purpose='EMAIL_VERIFICATION').first()
        self.assertIsNotNone(otp_record)
        self.assertEqual(len(otp_record.code), 6)

        # 2. Verify OTP code
        verify_resp = self.client.post(self.verify_otp_url, {
            'email': self.user_data['email'],
            'code': otp_record.code
        }, format='json')
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['message'], "Email Verified Successfully.")

        # 3. Register user
        reg_resp = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reg_resp.data['email'], self.user_data['email'])

        # Verify user is immediately marked as verified upon creation
        user = User.objects.get(email=self.user_data['email'])
        self.assertTrue(user.is_verified)

        # Verify OTP records are deleted after successful registration
        self.assertFalse(OTP.objects.filter(email=self.user_data['email']).exists())

    def test_signup_fails_without_verified_email(self):
        # Trying to signup directly should return 400 Bad Request
        response = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "Email verification is required before sign up.")

    def test_unverified_login_requests_otp(self):
        # Create unverified user directly in the database (simulating unverified state or legacy imports)
        user = User.objects.create_user(
            username='unverifieduser',
            email='unverified@example.com',
            password='SecureShield@2026',
            is_verified=False
        )
        
        # Try to login
        login_data = {
            'email': 'unverified@example.com',
            'password': 'SecureShield@2026'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        
        # Unverified user login should get a 400 Bad Request indicating unverified email
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "Email is not verified. Please verify your email first.")

    def test_verify_otp_invalid_and_expired(self):
        # Send OTP
        self.client.post(self.send_otp_url, {'email': self.user_data['email']}, format='json')
        
        # 1. Test incorrect OTP code
        verify_resp = self.client.post(self.verify_otp_url, {
            'email': self.user_data['email'],
            'code': '000000' # Wrong code
        }, format='json')
        self.assertEqual(verify_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(verify_resp.data['error'], "Invalid OTP. Please try again.")

        # 2. Test expired OTP
        otp_record = OTP.objects.filter(email=self.user_data['email'], purpose='EMAIL_VERIFICATION').first()
        from django.utils import timezone
        from datetime import timedelta
        otp_record.expires_at = timezone.now() - timedelta(minutes=1)
        otp_record.save()

        verify_resp_expired = self.client.post(self.verify_otp_url, {
            'email': self.user_data['email'],
            'code': otp_record.code
        }, format='json')
        self.assertEqual(verify_resp_expired.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(verify_resp_expired.data['error'], "OTP has expired. Please request a new one.")
