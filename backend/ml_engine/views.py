import os
import joblib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .apps import MlEngineConfig

class PredictLoginRiskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rf_model = MlEngineConfig.rf_model
        encoders = MlEngineConfig.encoders
        
        if rf_model is None or encoders is None:
            return Response(
                {"error": "ML Model not trained or not found on server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        data = request.data
        
        try:
            # Extract features from request with defaults
            failed_attempts = int(data.get('failed_attempts', 0))
            country = data.get('country', 'Unknown')
            device = data.get('device', 'Desktop')
            browser = data.get('browser', 'Chrome')
            login_time = int(data.get('login_time', 12))
            unknown_device = int(data.get('unknown_device', 0))

            # Encode categorical features
            def safe_transform(encoder, val):
                if val in encoder.classes_:
                    return encoder.transform([val])[0]
                else:
                    return encoder.transform(['Unknown'])[0]

            country_encoded = safe_transform(encoders['country'], country)
            device_encoded = safe_transform(encoders['device'], device)
            browser_encoded = safe_transform(encoders['browser'], browser)

            # Prepare feature array in the exact order of training
            features = [[
                failed_attempts,
                country_encoded,
                device_encoded,
                browser_encoded,
                login_time,
                unknown_device
            ]]

            # Predict probability of being malicious
            probabilities = rf_model.predict_proba(features)[0]
            threat_score = float(probabilities[1]) # Probability of class 1 (malicious)

            # Determine Risk Level
            if threat_score < 0.2:
                risk_level = "Safe"
            elif threat_score < 0.5:
                risk_level = "Warning"
            elif threat_score < 0.8:
                risk_level = "Suspicious"
            else:
                risk_level = "Critical"

            return Response({
                "threat_score": round(threat_score, 4),
                "risk_level": risk_level
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
