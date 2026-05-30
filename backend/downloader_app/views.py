import os
import mimetypes
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import DownloadHistory
from .serializers import DownloadHistorySerializer, AnalyzeSerializer, DownloadRequestSerializer
from .services.ytdlp_service import extract_video_info
from .services.download_manager import start_download, cancel_download
from .utils.validators import is_valid_youtube_url
from .utils.logger import get_logger
from .throttles import ProgressPollThrottle

logger = get_logger('views')


class AnalyzeView(APIView):
    """POST /api/analyze/ — extract metadata from YouTube URL."""

    def post(self, request):
        serializer = AnalyzeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        url = serializer.validated_data['url']
        is_valid, error = is_valid_youtube_url(url)
        if not is_valid:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        try:
            info = extract_video_info(url)
            return Response({'success': True, 'data': info})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Analyze error: {e}")
            return Response(
                {'error': 'Failed to fetch video information. Please check the URL and try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DownloadView(APIView):
    """POST /api/download/ — start a download task."""

    def post(self, request):
        serializer = DownloadRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        url = serializer.validated_data['url']
        quality = serializer.validated_data['quality']
        fmt = serializer.validated_data['format']

        is_valid, error = is_valid_youtube_url(url)
        if not is_valid:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        # Create DB record
        record = DownloadHistory.objects.create(
            url=url,
            quality=quality,
            format=fmt,
            status='pending',
        )

        # Try to get title quickly
        try:
            info = extract_video_info(url)
            record.title = info.get('title', '')
            record.thumbnail = info.get('thumbnail', '')
            record.duration = info.get('duration')
            record.save(update_fields=['title', 'thumbnail', 'duration'])
        except Exception:
            pass

        output_dir = str(settings.DOWNLOADS_ROOT)
        start_download(str(record.id), url, quality, fmt, output_dir)

        return Response({
            'success': True,
            'task_id': str(record.id),
            'message': 'Download started',
        }, status=status.HTTP_201_CREATED)


class ProgressView(APIView):
    """GET /api/progress/<task_id>/ — get download progress."""
    throttle_classes = [ProgressPollThrottle]

    def get(self, request, task_id):
        try:
            record = DownloadHistory.objects.get(id=task_id)
        except DownloadHistory.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Invalid task ID'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'task_id': str(record.id),
            'status': record.status,
            'progress': record.progress,
            'title': record.title,
            'thumbnail': record.thumbnail,
            'download_speed': record.download_speed,
            'eta': record.eta,
            'error_message': record.error_message,
            'file_size': record.file_size,
        })


class CancelView(APIView):
    """POST /api/cancel/<task_id>/ — cancel a download."""

    def post(self, request, task_id):
        try:
            record = DownloadHistory.objects.get(id=task_id)
        except DownloadHistory.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if record.status in ('completed', 'failed', 'cancelled'):
            return Response({'error': f'Cannot cancel task with status: {record.status}'}, status=status.HTTP_400_BAD_REQUEST)

        cancel_download(task_id)
        return Response({'success': True, 'message': 'Cancellation requested'})


class HistoryListView(APIView):
    """GET /api/history/ — list all download history."""

    def get(self, request):
        records = DownloadHistory.objects.all()[:100]
        serializer = DownloadHistorySerializer(records, many=True)
        return Response({'success': True, 'data': serializer.data})


class HistoryDeleteView(APIView):
    """DELETE /api/history/<id>/ — delete a history item."""

    def delete(self, request, pk):
        try:
            record = DownloadHistory.objects.get(id=pk)
        except DownloadHistory.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete file if exists
        if record.file_path and os.path.exists(record.file_path):
            try:
                os.remove(record.file_path)
            except Exception as e:
                logger.warning(f"Could not delete file {record.file_path}: {e}")

        record.delete()
        return Response({'success': True, 'message': 'Deleted successfully'})


class FileFetchView(APIView):
    """GET /api/file/<task_id>/ — download the completed file."""

    def get(self, request, task_id):
        try:
            record = DownloadHistory.objects.get(id=task_id)
        except DownloadHistory.DoesNotExist:
            raise Http404("Task not found")

        if record.status != 'completed':
            return Response(
                {'error': f'File not ready. Status: {record.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not record.file_path or not os.path.exists(record.file_path):
            return Response({'error': 'File not found on server'}, status=status.HTTP_404_NOT_FOUND)

        ext = os.path.splitext(record.file_path)[1].lower()
        content_type = 'audio/mpeg' if ext == '.mp3' else 'video/mp4'

        filename = f"{record.title or 'video'}{ext}"
        filename = filename.replace('"', '').replace('/', '_')

        response = FileResponse(
            open(record.file_path, 'rb'),
            content_type=content_type,
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = os.path.getsize(record.file_path)
        return response