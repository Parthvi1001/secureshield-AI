from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from adminpanel.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/ml/', include('ml_engine.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/scanner/', include('scanner.urls')),
    path('api/news/', include('news.urls')),
    path('api/history/', include('history.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/users/', include('users.urls')),
    path('api/admin/', include('adminpanel.urls')),
]

from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
