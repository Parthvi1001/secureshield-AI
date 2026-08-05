from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SignupView, VerifyEmailView, ForgotPasswordView, ResetPasswordView, LogoutView,
    CustomLoginView, VerifyLoginOTPView, RegisterSendOTPView, RegisterVerifyOTPView
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('verify-login-otp/', VerifyLoginOTPView.as_view(), name='verify_login_otp'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('register-send-otp/', RegisterSendOTPView.as_view(), name='register_send_otp'),
    path('register-verify-otp/', RegisterVerifyOTPView.as_view(), name='register_verify_otp'),
]
