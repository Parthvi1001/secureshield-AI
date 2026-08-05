from django.urls import path
from .views import SecurityAlertListView, SecurityAlertResolveView

urlpatterns = [
    path('', SecurityAlertListView.as_view(), name='alert-list'),
    path('<int:pk>/resolve/', SecurityAlertResolveView.as_view(), name='alert-resolve'),
]
