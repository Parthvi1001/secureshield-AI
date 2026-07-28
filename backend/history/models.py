from django.db import models
from django.conf import settings

class LoginHistory(models.Model):
    """
    Tracks all login attempts (both successful and failed) for auditing purposes.
    """
    # Foreign key to the user attempting to log in
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_history')
    # The IP address from which the login attempt originated
    ip_address = models.GenericIPAddressField()
    # The browser or device signature
    user_agent = models.CharField(max_length=255)
    # Geolocation / telemetry info
    country = models.CharField(max_length=100, default='Unknown')
    browser = models.CharField(max_length=100, default='Unknown')
    device = models.CharField(max_length=100, default='Unknown')
    # Machine Learning threat assessment
    threat_score = models.FloatField(default=0.0)
    # Whether the login was successful or failed
    is_success = models.BooleanField(default=False)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['threat_score']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        status = "Success" if self.is_success else "Failed"
        return f"{self.user.username} - {self.ip_address} ({status}) - Threat: {self.threat_score:.2f}"

