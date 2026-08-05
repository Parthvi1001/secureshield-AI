from rest_framework import serializers
from .models import SecurityAlert

class SecurityAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityAlert
        fields = ['id', 'severity', 'title', 'description', 'is_resolved', 'created_at']
