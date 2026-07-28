from django.urls import path
from .views import UserProfileView, PasswordChangeView, DeleteAccountView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
]
