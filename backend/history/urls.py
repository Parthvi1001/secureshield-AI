from django.urls import path
from .views import LoginHistoryListView, LoginHistoryStatsView

urlpatterns = [
    path('', LoginHistoryListView.as_view(), name='login_history_list'),
    path('stats/', LoginHistoryStatsView.as_view(), name='login_history_stats'),
]
