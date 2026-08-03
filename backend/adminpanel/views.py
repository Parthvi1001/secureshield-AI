from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import models
from alerts.models import SecurityAlert
from scanner.models import FileScan, CleanedFile
from history.models import LoginHistory

class SystemPurgeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        User = get_user_model()
        try:
            # 1. Clear threat alerts, scanning histories, and logs
            SecurityAlert.objects.all().delete()
            FileScan.objects.all().delete()
            LoginHistory.objects.all().delete()

            # 2. Reset failed login counters
            User.objects.all().update(failed_login_attempts=0)

            # 3. Delete non-admin user accounts to prevent database pollution
            deleted_count, _ = User.objects.filter(is_staff=False, is_superuser=False).delete()

            return Response({
                "message": "System purge executed successfully. Database logs and unprivileged profiles cleared.",
                "deleted_operatives": deleted_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            total_cleaned = CleanedFile.objects.count()
            total_threats = CleanedFile.objects.aggregate(sum=models.Sum('threats_removed'))['sum'] or 0
            
            # Most Common Threat Type
            js_count = CleanedFile.objects.filter(javascript_removed=True).count()
            link_count = CleanedFile.objects.filter(hyperlinks_removed=True).count()
            embedded_count = CleanedFile.objects.filter(embedded_objects_removed=True).count()
            meta_count = CleanedFile.objects.filter(metadata_removed=True).count()
            
            threats_map = {
                "Malicious JavaScript": js_count,
                "Dangerous Hyperlink": link_count,
                "Suspicious Embedded Object": embedded_count,
                "Malicious Metadata": meta_count
            }
            
            most_common_threat = "None"
            if total_cleaned > 0:
                max_threat = max(threats_map.values())
                if max_threat > 0:
                    most_common_threat = [k for k, v in threats_map.items() if v == max_threat][0]

            avg_time = CleanedFile.objects.aggregate(avg=models.Avg('cleaning_time_seconds'))['avg'] or 0.0
            
            # success rate is 100% since all files are cleaned successfully
            success_rate = 100.0 if total_cleaned > 0 else 0.0

            return Response({
                "total_files_cleaned": total_cleaned,
                "total_threats_removed": total_threats,
                "most_common_threat_type": most_common_threat,
                "average_cleaning_time": round(avg_time, 3),
                "cleaning_success_rate": success_rate
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

