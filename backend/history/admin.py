from django.contrib import admin
from adminpanel.admin import admin_site
from .models import LoginHistory

class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'country', 'browser', 'device', 'threat_score', 'is_success', 'created_at')
    list_filter = ('is_success', 'country', 'browser', 'device', 'created_at')
    search_fields = ('user__username', 'ip_address', 'country', 'browser', 'device')
    readonly_fields = ('user', 'ip_address', 'country', 'browser', 'device', 'threat_score', 'is_success', 'user_agent', 'created_at', 'updated_at')

admin_site.register(LoginHistory, LoginHistoryAdmin)
