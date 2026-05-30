from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='DownloadHistory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=500)),
                ('url', models.URLField(max_length=2000)),
                ('quality', models.CharField(choices=[('360p', '360p'), ('480p', '480p'), ('720p', '720p'), ('1080p', '1080p'), ('best', 'Best Available'), ('audio', 'Audio Only')], default='720p', max_length=20)),
                ('format', models.CharField(choices=[('mp4', 'MP4'), ('mp3', 'MP3')], default='mp4', max_length=10)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('analyzing', 'Analyzing'), ('downloading', 'Downloading'), ('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('progress', models.FloatField(default=0.0)),
                ('file_path', models.CharField(blank=True, max_length=1000)),
                ('file_size', models.BigIntegerField(blank=True, null=True)),
                ('thumbnail', models.URLField(blank=True, max_length=2000)),
                ('duration', models.IntegerField(blank=True, null=True)),
                ('error_message', models.TextField(blank=True)),
                ('download_speed', models.CharField(blank=True, max_length=50)),
                ('eta', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
