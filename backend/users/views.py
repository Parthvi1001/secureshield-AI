from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from alerts.models import SecurityAlert
from history.models import LoginHistory
from .serializers import UserProfileSerializer, PasswordChangeSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Calculate Security Score
        critical_alerts = SecurityAlert.objects.filter(user=user, severity='CRITICAL', is_resolved=False).count()
        high_alerts = SecurityAlert.objects.filter(user=user, severity='HIGH', is_resolved=False).count()
        medium_alerts = SecurityAlert.objects.filter(user=user, severity='MEDIUM', is_resolved=False).count()
        
        score_deduction = (critical_alerts * 20) + (high_alerts * 10) + (medium_alerts * 5)
        raw_score = max(0, 100 - score_deduction)
        
        if raw_score >= 90:
            grade = "A+"
        elif raw_score >= 80:
            grade = "B"
        elif raw_score >= 60:
            grade = "C"
        else:
            grade = "F"

        # 2. Get registered/distinct devices from LoginHistory
        devices_qs = LoginHistory.objects.filter(user=user).values(
            'device', 'browser', 'ip_address'
        ).annotate(
            last_used=models.Max('created_at')
        ).order_by('-last_used')

        devices_list = [
            {
                "device": d['device'],
                "browser": d['browser'],
                "ip_address": d['ip_address'],
                "last_used": d['last_used']
            }
            for d in devices_qs
        ]

        # 3. Serialize user profile
        serializer = UserProfileSerializer(user, context={'request': request})

        return Response({
            "profile": serializer.data,
            "security_score": {
                "raw": raw_score,
                "grade": grade
            },
            "registered_devices": devices_list
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(
            user, 
            data=request.data, 
            partial=True, 
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Operative clearance revoked. Account successfully deleted."}, status=status.HTTP_200_OK)
