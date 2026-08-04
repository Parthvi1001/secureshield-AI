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


import datetime
from django.utils import timezone

class SecurityHealthCardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Calculate stats
        total_scans = FileScan.objects.filter(user=user).count()
        threats_prevented = FileScan.objects.filter(user=user, status__in=['SUSPICIOUS', 'MALICIOUS']).count()
        
        # Most Common Threat
        from collections import Counter
        threats = FileScan.objects.filter(user=user, status__in=['SUSPICIOUS', 'MALICIOUS'])
        threat_types = []
        for t in threats:
            if t.malware_family:
                threat_types.append(t.malware_family)
            elif t.extension == 'pdf':
                threat_types.append("Phishing PDFs")
            elif t.extension == 'zip':
                threat_types.append("Suspicious Archives")
            elif t.extension == 'exe':
                threat_types.append("Malicious Executables")
            else:
                threat_types.append("Suspicious Files")
        
        if threat_types:
            most_common_threat = Counter(threat_types).most_common(1)[0][0]
        else:
            most_common_threat = "None"
            
        # Last Scan String
        latest_scan = FileScan.objects.filter(user=user).order_by('-created_at').first()
        if latest_scan:
            diff = timezone.now().date() - latest_scan.created_at.date()
            if diff.days == 0:
                last_scan_str = "Today"
            elif diff.days == 1:
                last_scan_str = "Yesterday"
            else:
                last_scan_str = latest_scan.created_at.strftime("%B %d, %Y")
        else:
            last_scan_str = "No scans yet"
            
        # Monthly Progress
        now = timezone.now()
        start_cur = now - datetime.timedelta(days=30)
        start_prev = now - datetime.timedelta(days=60)
        
        cur_total = FileScan.objects.filter(user=user, created_at__gte=start_cur).count()
        prev_total = FileScan.objects.filter(user=user, created_at__gte=start_prev, created_at__lt=start_cur).count()
        
        if cur_total == 0 and prev_total == 0:
            progress_str = "↑ +0% Stable"
        else:
            cur_safe = FileScan.objects.filter(user=user, created_at__gte=start_cur, status='CLEAN').count()
            prev_safe = FileScan.objects.filter(user=user, created_at__gte=start_prev, created_at__lt=start_cur, status='CLEAN').count()
            
            cur_rate = (cur_safe / cur_total * 100) if cur_total > 0 else 100.0
            prev_rate = (prev_safe / prev_total * 100) if prev_total > 0 else 85.0
            
            diff = int(round(cur_rate - prev_rate))
            if diff >= 0:
                progress_str = f"↑ +{diff}% Improvement"
            else:
                progress_str = f"↓ {diff}% Decline"
                
        # Recommendations
        recs = []
        pdf_count = FileScan.objects.filter(user=user, extension='pdf').count()
        zip_count = FileScan.objects.filter(user=user, extension='zip').count()
        exe_count = FileScan.objects.filter(user=user, extension='exe').count()
        malicious_count = FileScan.objects.filter(user=user, status='MALICIOUS').count()
        suspicious_count = FileScan.objects.filter(user=user, status='SUSPICIOUS').count()
        cleaned_count = CleanedFile.objects.filter(user=user).count()
        
        if pdf_count > 0:
            recs.append("Avoid opening password-protected PDFs from unknown senders.")
        if zip_count > 0 or exe_count > 0:
            recs.append("Scan downloaded compressed archives (.zip) or executables (.exe) before opening.")
        if malicious_count > 0 or suspicious_count > 0:
            recs.append("Review files with external links or scripts before sharing them.")
        if cleaned_count > 0:
            recs.append("Only download files cleaned and sanitized by SecureShield.")
            
        default_recs = [
            "Always run file scans on downloaded attachments before executing them.",
            "Ensure regular scanning of archived zip files to prevent zip bomb attacks.",
            "Regularly check your security alerts feed to acknowledge system interventions."
        ]
        for r in default_recs:
            if len(recs) < 3 and r not in recs:
                recs.append(r)
                
        # Overall Security Score Calculation
        total_threat_scans = FileScan.objects.filter(user=user, status__in=['SUSPICIOUS', 'MALICIOUS'])
        resolved_threat_scans_count = CleanedFile.objects.filter(user=user).count()
        unresolved_threat_scans_count = max(0, total_threat_scans.count() - resolved_threat_scans_count)
        
        critical_alerts = SecurityAlert.objects.filter(user=user, severity='CRITICAL', is_resolved=False).count()
        high_alerts = SecurityAlert.objects.filter(user=user, severity='HIGH', is_resolved=False).count()
        medium_alerts = SecurityAlert.objects.filter(user=user, severity='MEDIUM', is_resolved=False).count()
        
        score = 100
        score -= (unresolved_threat_scans_count * 15)
        score -= (resolved_threat_scans_count * 3)
        score -= (critical_alerts * 20) + (high_alerts * 10) + (medium_alerts * 5)
        
        clean_scans = FileScan.objects.filter(user=user, status='CLEAN').count()
        score += min(15, clean_scans * 2)
        
        seven_days_ago = timezone.now() - datetime.timedelta(days=7)
        has_recent_activity = FileScan.objects.filter(user=user, created_at__gte=seven_days_ago).exists()
        if has_recent_activity:
            score += 5
            
        score = max(0, min(100, score))
        
        return Response({
            "security_score": score,
            "files_scanned": total_scans,
            "threats_prevented": threats_prevented,
            "most_common_threat": most_common_threat,
            "last_scan": last_scan_str,
            "recommendations": recs,
            "monthly_progress": progress_str
        }, status=status.HTTP_200_OK)

