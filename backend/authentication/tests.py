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
        self.verify_email_url = reverse('verify_email')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'SecureShield@2026'
        }

    def test_signup_flow(self):
        # 1. Register a new user
        response = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], self.user_data['email'])
        
        # Verify user starts as unverified
        user = User.objects.get(email=self.user_data['email'])
        self.assertFalse(user.is_verified)
        
        # Verify an OTP code was generated
        otp_exists = OTP.objects.filter(user=user, purpose='EMAIL_VERIFICATION').exists()
        self.assertTrue(otp_exists)

    def test_unverified_login_requests_otp(self):
        # Register user
        self.client.post(self.signup_url, self.user_data, format='json')
        
        # Try to login with correct credentials
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        
        # Unverified user login should get a 400 Bad Request indicating unverified email
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], "Email is not verified. Please verify your email first.")

    def test_verify_email_and_login(self):
        # Register user
        self.client.post(self.signup_url, self.user_data, format='json')
        user = User.objects.get(email=self.user_data['email'])
        otp_record = OTP.objects.filter(user=user, purpose='EMAIL_VERIFICATION').first()
        
        # Verify with OTP
        verify_data = {
            'email': self.user_data['email'],
            'code': otp_record.code
        }
        response = self.client.post(self.verify_email_url, verify_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], "Email verified successfully.")
        
        # User should now be verified
        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        
        # Now login should return tokens (or OTP if suspicious, but by default on localhost threat = 0.0)
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        login_resp = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_resp.data)
        self.assertIn('refresh', login_resp.data)
