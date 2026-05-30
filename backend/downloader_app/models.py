from django.db import models
import uuid


class DownloadHistory(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('analyzing', 'Analyzing'),
        ('downloading', 'Downloading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    FORMAT_CHOICES = [
        ('mp4', 'MP4'),
        ('mp3', 'MP3'),
    ]

    QUALITY_CHOICES = [
        ('360p', '360p'),
        ('480p', '480p'),
        ('720p', '720p'),
        ('1080p', '1080p'),
        ('best', 'Best Available'),
        ('audio', 'Audio Only'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=500, blank=True)
    url = models.URLField(max_length=2000)
    quality = models.CharField(max_length=20, choices=QUALITY_CHOICES, default='720p')
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='mp4')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.FloatField(default=0.0)
    file_path = models.CharField(max_length=1000, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    thumbnail = models.URLField(max_length=2000, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # seconds
    error_message = models.TextField(blank=True)
    download_speed = models.CharField(max_length=50, blank=True)
    eta = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title or self.url} - {self.status}"

    @property
    def task_id(self):
        return str(self.id)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'url': self.url,
            'quality': self.quality,
            'format': self.format,
            'status': self.status,
            'progress': self.progress,
            'file_size': self.file_size,
            'thumbnail': self.thumbnail,
            'duration': self.duration,
            'error_message': self.error_message,
            'download_speed': self.download_speed,
            'eta': self.eta,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
