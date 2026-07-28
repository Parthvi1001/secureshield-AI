from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'mobile',
            'photo',
            'photo_url',
            'country',
        ]
        read_only_fields = ['id', 'country']
        extra_kwargs = {
            'photo': {'write_only': True, 'required': False}
        }

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo:
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email__iexact=value).exists():
            raise serializers.ValidationError("An operative with this email already exists.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username__iexact=value).exists():
            raise serializers.ValidationError("An operative with this username already exists.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect current password credentials.")
        return value
