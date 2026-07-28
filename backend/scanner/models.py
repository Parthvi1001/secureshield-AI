from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator, MaxLengthValidator

class FileScan(models.Model):
    """
    Records the outcome of ML-based file scans for malware detection.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CLEAN', 'Clean'),
        ('SUSPICIOUS', 'Suspicious'),
        ('MALICIOUS', 'Malicious'),
    ]

    # The user who requested the scan
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scans')
    # Original file name uploaded by user
    file_name = models.CharField(max_length=255)
    # SHA-256 hash of the file. Exactly 64 chars.
    file_hash = models.CharField(
        max_length=64, 
        validators=[MinLengthValidator(64), MaxLengthValidator(64)],
        db_index=True
    )
    # File metadata
    file_size = models.IntegerField(default=0)
    extension = models.CharField(max_length=10, blank=True)
    risk_score = models.IntegerField(default=0)
    # Outcome of the scan
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    # If malicious, the identified malware family (nullable)
    malware_family = models.CharField(max_length=100, blank=True, null=True)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['file_hash']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Scan: {self.file_name} ({self.status})"
