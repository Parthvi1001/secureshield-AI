from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import MagicMock
from ml_engine.apps import MlEngineConfig

User = get_user_model()

class MLEngineAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='mluser',
            email='ml@example.com',
            password='SecureShield@2026',
            is_verified=True
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        self.predict_url = reverse('predict_login_risk')

    def test_predict_risk_endpoint_with_mocked_model(self):
        # Mock RandomForest model and LabelEncoders
        mock_rf = MagicMock()
        mock_rf.predict_proba.return_value = [[0.2, 0.8]]
        
        mock_encoder = MagicMock()
        mock_encoder.classes_ = ['US', 'Unknown']
        mock_encoder.transform.return_value = [0]
        
        # Save original values to restore later
        orig_model = MlEngineConfig.rf_model
        orig_encoders = MlEngineConfig.encoders
        
        MlEngineConfig.rf_model = mock_rf
        MlEngineConfig.encoders = {
            'country': mock_encoder,
            'device': mock_encoder,
            'browser': mock_encoder
        }
        
        try:
            post_data = {
                'failed_attempts': 3,
                'country': 'US',
                'device': 'Desktop',
                'browser': 'Chrome',
                'login_time': 14,
                'unknown_device': 1
            }
            response = self.client.post(self.predict_url, post_data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['risk_level'], 'Critical')
            self.assertEqual(response.data['threat_score'], 0.8)
        finally:
            # Restore original state
            MlEngineConfig.rf_model = orig_model
            MlEngineConfig.encoders = orig_encoders
