from django.db import models
from django.core.validators import URLValidator

class CyberNews(models.Model):
    """
    Curated cybersecurity news articles gathered by the scraper.
    """
    # Headline of the article
    title = models.CharField(max_length=500)
    # URL to the original source
    url = models.URLField(unique=True, validators=[URLValidator()])
    # Publisher or domain name
    source = models.CharField(max_length=100, db_index=True)
    # The actual date the article was published by the source
    published_date = models.DateTimeField(db_index=True)
    # Machine-assigned category
    category = models.CharField(max_length=50, blank=True)
    # Timestamps (when the record was scraped/created in our DB)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_date']
        indexes = [
            models.Index(fields=['-published_date']),
            models.Index(fields=['source']),
        ]

    def __str__(self):
        return f"{self.title} ({self.source})"
