from django.urls import path
from .views import SystemPurgeView, AdminStatsView

urlpatterns = [
    path('purge/', SystemPurgeView.as_view(), name='system-purge'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
