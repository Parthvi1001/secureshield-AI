from django.contrib import admin
from adminpanel.admin import admin_site
from .models import FileScan

class FileScanAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_name', 'status', 'risk_score', 'malware_family', 'file_size', 'created_at')
    list_filter = ('status', 'malware_family', 'created_at')
    search_fields = ('user__username', 'file_name', 'file_hash')
    readonly_fields = ('user', 'file_name', 'file_hash', 'file_size', 'extension', 'risk_score', 'status', 'malware_family', 'created_at', 'updated_at')

admin_site.register(FileScan, FileScanAdmin)
