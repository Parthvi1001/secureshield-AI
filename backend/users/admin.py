from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from adminpanel.admin import admin_site
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'mobile', 'country', 'is_verified', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_verified', 'country', 'is_staff')
    search_fields = ('username', 'email', 'mobile', 'country')
    actions = ['block_users', 'unblock_users']

    fieldsets = UserAdmin.fieldsets + (
        ('Profile Telemetry', {'fields': ('mobile', 'photo', 'ip_address', 'country', 'browser', 'os', 'device', 'is_verified')}),
    )

    # Custom actions
    @admin.action(description='Block selected operatives')
    def block_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, "Selected operatives have been blocked.")

    @admin.action(description='Unblock selected operatives')
    def unblock_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, "Selected operatives have been unblocked.")

admin_site.register(CustomUser, CustomUserAdmin)
