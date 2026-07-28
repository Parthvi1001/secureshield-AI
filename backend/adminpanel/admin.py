from django.contrib.admin import AdminSite
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from history.models import LoginHistory
from alerts.models import SecurityAlert
from scanner.models import FileScan

class SecureShieldAdminSite(AdminSite):
    site_header = "SecureShield AI Command Administration"
    site_title = "SecureShield AI Admin"
    index_title = "Security & Telemetry Overview Dashboard"

    def index(self, request, extra_context=None):
        User = get_user_model()
        
        # 1. Dashboard Statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        blocked_users = User.objects.filter(is_active=False).count()
        
        total_scans = FileScan.objects.count()
        clean_scans = FileScan.objects.filter(status='CLEAN').count()
        threat_scans = FileScan.objects.exclude(status='CLEAN').count()
        
        total_alerts = SecurityAlert.objects.count()
        unresolved_alerts = SecurityAlert.objects.filter(is_resolved=False).count()
        
        avg_threat = LoginHistory.objects.aggregate(avg_score=Avg('threat_score'))['avg_score'] or 0.0

        # 2. Recent Activities
        recent_logins = LoginHistory.objects.select_related('user').order_by('-created_at')[:5]
        recent_alerts = SecurityAlert.objects.select_related('user').order_by('-created_at')[:5]
        recent_scans = FileScan.objects.select_related('user').order_by('-created_at')[:5]

        extra_context = extra_context or {}
        extra_context.update({
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'blocked_users': blocked_users,
                'total_scans': total_scans,
                'clean_scans': clean_scans,
                'threat_scans': threat_scans,
                'total_alerts': total_alerts,
                'unresolved_alerts': unresolved_alerts,
                'avg_threat_percent': f"{avg_threat * 100:.1f}%"
            },
            'recent_logins': recent_logins,
            'recent_alerts': recent_alerts,
            'recent_scans': recent_scans
        })

        return super().index(request, extra_context)

admin_site = SecureShieldAdminSite(name='secureshield_admin')
