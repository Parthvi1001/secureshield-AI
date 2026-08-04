from django.urls import path
from .views import DashboardSummaryView, SecurityHealthCardView

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('health-card/', SecurityHealthCardView.as_view(), name='security_health_card'),
]
