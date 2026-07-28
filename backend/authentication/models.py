from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random

class OTP(models.Model):
    """
    Model for managing One-Time Passwords for Email Verification and Password Reset.
    """
    PURPOSE_CHOICES = [
        ('EMAIL_VERIFICATION', 'Email Verification'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('LOGIN_2FA', 'Login 2FA'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(random.randint(100000, 999999))
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'code', 'purpose']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.purpose} - {self.code}"
