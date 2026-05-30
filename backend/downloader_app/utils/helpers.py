import os
import math


def format_filesize(size_bytes: int) -> str:
    """Convert bytes to human-readable file size."""
    if not size_bytes:
        return 'Unknown'
    if size_bytes == 0:
        return '0 B'
    size_names = ('B', 'KB', 'MB', 'GB', 'TB')
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f'{s} {size_names[i]}'


def format_duration(seconds: int) -> str:
    """Convert seconds to HH:MM:SS or MM:SS."""
    if not seconds:
        return 'Unknown'
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f'{hours:02d}:{minutes:02d}:{secs:02d}'
    return f'{minutes:02d}:{secs:02d}'


def get_quality_format_string(quality: str, fmt: str) -> str:
    """Map quality + format to yt-dlp format string."""
    if fmt == 'mp3':
        return 'bestaudio/best'

    quality_map = {
        '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best[height<=360]',
        '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]',
        '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]',
        '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
        'audio': 'bestaudio/best',
    }
    return quality_map.get(quality, quality_map['720p'])


def ensure_downloads_dir(path: str) -> str:
    """Ensure downloads directory exists and return it."""
    os.makedirs(path, exist_ok=True)
    return path
