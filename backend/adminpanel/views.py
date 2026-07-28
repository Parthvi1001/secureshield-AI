from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.contrib.auth import get_user_model
from alerts.models import SecurityAlert
from scanner.models import FileScan
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
