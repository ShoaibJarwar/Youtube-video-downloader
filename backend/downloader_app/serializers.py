from rest_framework import serializers
from .models import DownloadHistory


class DownloadHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DownloadHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnalyzeSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)


class DownloadRequestSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
    quality = serializers.ChoiceField(
        choices=['360p', '480p', '720p', '1080p', 'best', 'audio'],
        default='720p'
    )
    format = serializers.ChoiceField(choices=['mp4', 'mp3'], default='mp4')


class ProgressSerializer(serializers.Serializer):
    task_id = serializers.UUIDField()
    status = serializers.CharField()
    progress = serializers.FloatField()
    download_speed = serializers.CharField(allow_blank=True)
    eta = serializers.CharField(allow_blank=True)
    error_message = serializers.CharField(allow_blank=True)
