from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import OTP
from history.models import LoginHistory
from alerts.models import SecurityAlert
from .serializers import (
    SignupSerializer, VerifyEmailSerializer, 
    ForgotPasswordSerializer, ResetPasswordSerializer, LogoutSerializer,
    LoginSerializer, VerifyLoginOTPSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from user_agents import parse
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
try:
    from ml_engine.views import load_ml_assets
    import ml_engine.views as ml_views
except ImportError:
    pass

User = get_user_model()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = SignupSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        request = self.request
        ip = get_client_ip(request)
        user.ip_address = ip

        if ip and ip != '127.0.0.1':
            try:
                resp = requests.get(f'https://ipapi.co/{ip}/json/', timeout=3)
                if resp.status_code == 200:
                    user.country = resp.json().get('country_name', 'Unknown')
            except Exception:
                pass

        ua_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(ua_string)
        user.browser = user_agent.browser.family
        user.os = user_agent.os.family
        user.device = user_agent.device.family
        
        user.save()
        otp = OTP.objects.create(user=user, purpose='EMAIL_VERIFICATION')
        from .emails import send_otp_email
        send_otp_email(user.email, otp.code, 'EMAIL_VERIFICATION')


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.filter(user=user, code=code, purpose='EMAIL_VERIFICATION', is_used=False).last()
                if otp and otp.is_valid():
                    otp.is_used = True
                    otp.save()
                    user.is_verified = True
                    user.save()
                    return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.create(user=user, purpose='PASSWORD_RESET')
                from .emails import send_otp_email
                send_otp_email(user.email, otp.code, 'PASSWORD_RESET')
                return Response({"message": "Password reset OTP sent."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"message": "If the email exists, an OTP will be sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.filter(user=user, code=code, purpose='PASSWORD_RESET', is_used=False).last()
                if otp and otp.is_valid():
                    otp.is_used = True
                    otp.save()
                    user.set_password(new_password)
                    user.save()
                    return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data['refresh']
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
            except Exception:
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomLoginView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.is_verified:
            return Response({"error": "Email is not verified. Please verify your email first."}, status=status.HTTP_400_BAD_REQUEST)
            
        ip = get_client_ip(request)
        ua_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(ua_string)
        
        browser = user_agent.browser.family
        device = user_agent.device.family
        
        country = 'Unknown'
        if ip and ip != '127.0.0.1':
            try:
                resp = requests.get(f'https://ipapi.co/{ip}/json/', timeout=2)
                if resp.status_code == 200:
                    country = resp.json().get('country_name', 'Unknown')
            except:
                pass
                
        unknown_device = 1 if user.device != device or user.country != country else 0
        login_time = timezone.now().hour
        
        threat_score = 0.0
        risk_level = "Safe"
        
        try:
            load_ml_assets()
            if ml_views.rf_model and ml_views.encoders:
                def safe_transform(encoder, val):
                    return encoder.transform([val])[0] if val in encoder.classes_ else encoder.transform(['Unknown'])[0]
                
                c_enc = safe_transform(ml_views.encoders['country'], country)
                d_enc = safe_transform(ml_views.encoders['device'], device)
                b_enc = safe_transform(ml_views.encoders['browser'], browser)
                
                features = [[user.failed_login_attempts, c_enc, d_enc, b_enc, login_time, unknown_device]]
                prob = ml_views.rf_model.predict_proba(features)[0]
                threat_score = float(prob[1])
                
                if threat_score < 0.2: risk_level = "Safe"
                elif threat_score < 0.5: risk_level = "Warning"
                elif threat_score < 0.8: risk_level = "Suspicious"
                else: risk_level = "Critical"
        except Exception as e:
            pass
            
        if not user.check_password(password):
            user.failed_login_attempts += 1
            user.save()
            LoginHistory.objects.create(
                user=user, 
                ip_address=ip, 
                user_agent=ua_string, 
                is_success=False,
                browser=browser,
                device=device,
                country=country,
                threat_score=threat_score
            )
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        LoginHistory.objects.create(
            user=user, 
            ip_address=ip, 
            user_agent=ua_string, 
            is_success=True,
            browser=browser,
            device=device,
            country=country,
            threat_score=threat_score
        )
        
        if risk_level in ["Suspicious", "Critical"]:
            SecurityAlert.objects.create(
                user=user,
                severity=risk_level.upper(),
                title=f"Suspicious Login Blocked ({risk_level})",
                description=f"ML Engine detected anomalous login. Score: {threat_score:.4f}. Context: {device}, {country}, {browser}."
            )
            otp = OTP.objects.create(user=user, purpose='LOGIN_2FA')
            from .emails import send_otp_email
            send_otp_email(user.email, otp.code, 'LOGIN_2FA', risk_level=risk_level)
            
            return Response({
                "requires_otp": True,
                "email": user.email,
                "risk_level": risk_level,
                "threat_score": threat_score
            }, status=status.HTTP_200_OK)
            
        user.failed_login_attempts = 0
        user.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)

class VerifyLoginOTPView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = VerifyLoginOTPSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                otp = OTP.objects.filter(user=user, code=serializer.validated_data['code'], purpose='LOGIN_2FA', is_used=False).last()
                
                if otp and otp.is_valid():
                    otp.is_used = True
                    otp.save()
                    user.failed_login_attempts = 0
                    user.save()
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        "access": str(refresh.access_token),
                        "refresh": str(refresh)
                    }, status=status.HTTP_200_OK)
                return Response({"error": "Invalid or expired 2FA code."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
