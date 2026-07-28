from django.contrib import admin
from adminpanel.admin import admin_site
from .models import SecurityAlert

class SecurityAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'severity', 'is_resolved', 'created_at')
    list_filter = ('severity', 'is_resolved', 'created_at')
    search_fields = ('user__username', 'title', 'description')
    actions = ['resolve_alerts']

    @admin.action(description='Mark selected alerts as resolved')
    def resolve_alerts(self, request, queryset):
        queryset.update(is_resolved=True)
        self.message_user(request, "Selected alerts have been marked as resolved.")

admin_site.register(SecurityAlert, SecurityAlertAdmin)
