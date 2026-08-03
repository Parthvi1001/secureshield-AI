from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count
from alerts.models import SecurityAlert
from history.models import LoginHistory
from scanner.models import FileScan, CleanedFile

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        critical_alerts = SecurityAlert.objects.filter(user=user, severity='CRITICAL', is_resolved=False).count()
        high_alerts = SecurityAlert.objects.filter(user=user, severity='HIGH', is_resolved=False).count()
        medium_alerts = SecurityAlert.objects.filter(user=user, severity='MEDIUM', is_resolved=False).count()
        
        score_deduction = (critical_alerts * 20) + (high_alerts * 10) + (medium_alerts * 5)
        raw_score = max(0, 100 - score_deduction)
        
        if raw_score >= 90:
            security_score = "A+"
        elif raw_score >= 80:
            security_score = "B"
        elif raw_score >= 60:
            security_score = "C"
        else:
            security_score = "F"

        blocked_threats = FileScan.objects.filter(user=user, status='MALWARE').count()
        
        suspicious_logins = SecurityAlert.objects.filter(
            user=user, 
            title__icontains='Suspicious Login'
        ).count()
        
        protected_files = FileScan.objects.filter(user=user, status='CLEAN').count()

        last_login_obj = LoginHistory.objects.filter(user=user, is_success=True).order_by('-created_at').first()
        last_login = last_login_obj.created_at if last_login_obj else None

        recent_alerts = SecurityAlert.objects.filter(user=user).order_by('-created_at')[:5]
        alerts_data = [{
            "id": alert.id,
            "title": alert.title,
            "severity": alert.severity,
            "description": alert.description,
            "created_at": alert.created_at
        } for alert in recent_alerts]

        recent_scans = FileScan.objects.filter(user=user).order_by('-created_at')[:5]
        scans_data = [{
            "id": scan.id,
            "filename": scan.file_name,
            "status": scan.status,
            "created_at": scan.created_at
        } for scan in recent_scans]

        recent_cleaned = CleanedFile.objects.filter(user=user).order_by('-created_at')[:5]
        cleaned_data = [{
            "id": c.id,
            "filename": c.file_name,
            "threats_removed": c.threats_removed,
            "status": c.status,
            "download_url": request.build_absolute_uri(c.cleaned_file.url) if c.cleaned_file else "",
            "created_at": c.created_at
        } for c in recent_cleaned]

        return Response({
            "security_score": security_score,
            "last_login": last_login,
            "protected_files": protected_files,
            "blocked_threats": blocked_threats,
            "suspicious_logins": suspicious_logins,
            "recent_alerts": alerts_data,
            "recent_scans": scans_data,
            "recent_cleaned_files": cleaned_data
        }, status=status.HTTP_200_OK)

