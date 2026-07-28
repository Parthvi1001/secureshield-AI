from rest_framework import serializers
from .models import LoginHistory

class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = [
            'id',
            'ip_address',
            'user_agent',
            'country',
            'browser',
            'device',
            'threat_score',
            'is_success',
            'created_at',
        ]
