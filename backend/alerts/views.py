from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SecurityAlert
from .serializers import SecurityAlertSerializer

class SecurityAlertListView(generics.ListAPIView):
    serializer_class = SecurityAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return all active (unresolved) security alerts for the current user
        return SecurityAlert.objects.filter(user=self.request.user, is_resolved=False).order_by('-created_at')

class SecurityAlertResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            alert = SecurityAlert.objects.get(id=pk, user=request.user)
            alert.is_resolved = True
            alert.save()
            return Response({"message": "Alert acknowledged successfully."}, status=status.HTTP_200_OK)
        except SecurityAlert.DoesNotExist:
            return Response({"error": "Alert not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)
