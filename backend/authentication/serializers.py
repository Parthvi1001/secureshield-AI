from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'].lower()
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate_username(self, value):
        username = value.strip()
        
        # 1. Not allowed only digits
        if username.isdigit():
            raise serializers.ValidationError("Username cannot consist only of numbers.")
            
        # Must contain at least one letter
        has_letter = any(c.isalpha() for c in username)
        if not has_letter:
            raise serializers.ValidationError("Username must contain at least one letter.")
            
        # 2. If only characters, must be more than 3
        is_only_letters = username.isalpha()
        if is_only_letters and len(username) <= 3:
            raise serializers.ValidationError("Username must be more than 3 characters if it only contains letters.")
            
        # Check if username is already taken
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with that username already exists.")
            
        return username

    def validate_email(self, value):
        """Ensure email is normalized and unique (case-insensitive)."""
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return email

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return email

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        # Keep this silent about existence to avoid user enumeration; only validate format
        return value.lower()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return email

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

    def validate_email(self, value):
        return value.lower()

class VerifyLoginOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)

    def validate_email(self, value):
        return value.lower()
