from rest_framework import serializers
from .models import CyberNews

class CyberNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CyberNews
        fields = '__all__'
