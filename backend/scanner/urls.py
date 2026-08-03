from django.urls import path
from .views import FileUploadView, FileCleanView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    path('clean/', FileCleanView.as_view(), name='file_clean'),
]
