from django.urls import path
from .views import PredictLoginRiskView

urlpatterns = [
    path('predict-login-risk/', PredictLoginRiskView.as_view(), name='predict_login_risk'),
]
