from django.urls import path
from .views import SystemPurgeView

urlpatterns = [
    path('purge/', SystemPurgeView.as_view(), name='system-purge'),
]
