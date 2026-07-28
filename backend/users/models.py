from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Custom user model for SecureShield AI platform.
    """
    # Email is used as the primary identifier for users
    email = models.EmailField(unique=True, db_index=True)
    # Tracks if the user has verified their email address
    is_verified = models.BooleanField(default=False)
    
    # Automatically Collected Fields during Registration
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    browser = models.CharField(max_length=100, null=True, blank=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    device = models.CharField(max_length=100, null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    
    # Profile & Contact Fields
    mobile = models.CharField(max_length=20, null=True, blank=True)
    photo = models.FileField(upload_to='profile_photos/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.username
