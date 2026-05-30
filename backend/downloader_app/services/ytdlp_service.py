import yt_dlp
import os
from ..utils.logger import get_logger
from ..utils.helpers import get_quality_format_string, ensure_downloads_dir

logger = get_logger('ytdlp_service')


def extract_video_info(url: str) -> dict:
    """Extract metadata from a YouTube URL without downloading."""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
        'writeinfojson': False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except yt_dlp.utils.DownloadError as e:
            raise ValueError(f"Could not fetch video info: {str(e)}")

    if not info:
        raise ValueError("No video information returned")

    # Parse available formats
    formats = info.get('formats', [])
    available_qualities = set()

    for f in formats:
        height = f.get('height')
        if height:
            if height <= 360:
                available_qualities.add('360p')
            if height <= 480:
                available_qualities.add('480p')
            if height <= 720:
                available_qualities.add('720p')
            if height <= 1080:
                available_qualities.add('1080p')

    quality_order = ['360p', '480p', '720p', '1080p']
    sorted_qualities = [q for q in quality_order if q in available_qualities]
    if not sorted_qualities:
        sorted_qualities = ['360p', '480p', '720p']

    # Get best thumbnail
    thumbnails = info.get('thumbnails', [])
    thumbnail = ''
    if thumbnails:
        best = max(thumbnails, key=lambda t: (t.get('width', 0) or 0) * (t.get('height', 0) or 0), default=None)
        thumbnail = best.get('url', '') if best else thumbnails[-1].get('url', '')
    if not thumbnail:
        thumbnail = info.get('thumbnail', '')

    return {
        'title': info.get('title', 'Unknown Title'),
        'thumbnail': thumbnail,
        'duration': info.get('duration'),
        'uploader': info.get('uploader', ''),
        'view_count': info.get('view_count'),
        'description': (info.get('description') or '')[:500],
        'upload_date': info.get('upload_date', ''),
        'available_qualities': sorted_qualities,
        'formats': ['mp4', 'mp3'],
        'is_playlist': info.get('_type') == 'playlist',
        'playlist_count': info.get('playlist_count'),
    }


def download_video(url: str, quality: str, fmt: str, output_dir: str,
                   task_id: str, progress_callback=None) -> str:
    """Download video/audio. Returns file path."""
    ensure_downloads_dir(output_dir)
    format_string = get_quality_format_string(quality, fmt)
    output_template = os.path.join(output_dir, f'{task_id}.%(ext)s')

    def progress_hook(d):
        if progress_callback is None:
            return
        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
            downloaded = d.get('downloaded_bytes', 0)
            speed = d.get('speed', 0)
            eta = d.get('eta', 0)

            progress = (downloaded / total * 100) if total > 0 else 0
            speed_str = _format_speed(speed)
            eta_str = _format_eta(eta)
            progress_callback(progress, speed_str, eta_str, 'downloading')
        elif d['status'] == 'finished':
            progress_callback(95, '', '', 'processing')

    ydl_opts = {
        'format': format_string,
        'outtmpl': output_template,
        'progress_hooks': [progress_hook],
        'quiet': True,
        'no_warnings': True,
        'merge_output_format': 'mp4' if fmt == 'mp4' else None,
    }

    if fmt == 'mp3':
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.download([url])
        except yt_dlp.utils.DownloadError as e:
            raise ValueError(f"Download failed: {str(e)}")

    # Find the output file
    expected_ext = 'mp3' if fmt == 'mp3' else 'mp4'
    expected_path = os.path.join(output_dir, f'{task_id}.{expected_ext}')
    if os.path.exists(expected_path):
        return expected_path

    # Search for any file with the task_id prefix
    for f in os.listdir(output_dir):
        if f.startswith(task_id):
            return os.path.join(output_dir, f)

    raise ValueError("Downloaded file not found")


def _format_speed(speed) -> str:
    if not speed:
        return ''
    if speed > 1024 * 1024:
        return f'{speed / (1024 * 1024):.1f} MB/s'
    elif speed > 1024:
        return f'{speed / 1024:.1f} KB/s'
    return f'{speed:.0f} B/s'


def _format_eta(eta) -> str:
    if not eta:
        return ''
    if eta > 3600:
        return f'{eta // 3600}h {(eta % 3600) // 60}m'
    elif eta > 60:
        return f'{eta // 60}m {eta % 60}s'
    return f'{eta}s'
