from django.db import models
from django.conf import settings

class SecurityAlert(models.Model):
    """
    System-generated alerts regarding security threats for a specific user.
    """
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    # The user who is affected by this alert
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts')
    # Risk level of the alert
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, db_index=True)
    # Short summary of the incident
    title = models.CharField(max_length=255)
    # Detailed payload and context
    description = models.TextField()
    # Whether the user has acknowledged/resolved the alert
    is_resolved = models.BooleanField(default=False, db_index=True)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_resolved', '-created_at']),
            models.Index(fields=['severity']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.title} - {self.user.username}"
