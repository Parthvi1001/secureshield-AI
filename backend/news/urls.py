from django.urls import path
from .views import CyberNewsListView

urlpatterns = [
    path('', CyberNewsListView.as_view(), name='news_list'),
]
