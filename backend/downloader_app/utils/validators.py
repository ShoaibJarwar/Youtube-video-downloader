import re
from urllib.parse import urlparse


ALLOWED_DOMAINS = [
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
    'm.youtube.com',
    'music.youtube.com',
]

YOUTUBE_URL_PATTERNS = [
    r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=[\w-]+',
    r'(?:https?://)?(?:www\.)?youtube\.com/playlist\?list=[\w-]+',
    r'(?:https?://)?youtu\.be/[\w-]+',
    r'(?:https?://)?(?:www\.)?youtube\.com/shorts/[\w-]+',
    r'(?:https?://)?music\.youtube\.com/watch\?v=[\w-]+',
]


def is_valid_youtube_url(url: str) -> tuple[bool, str]:
    """Validate a YouTube URL. Returns (is_valid, error_message)."""
    if not url:
        return False, "URL is required"

    url = url.strip()

    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            url = 'https://' + url
            parsed = urlparse(url)
    except Exception:
        return False, "Invalid URL format"

    hostname = parsed.hostname or ''
    if hostname.startswith('www.'):
        hostname = hostname[4:]

    if hostname not in [d.replace('www.', '') for d in ALLOWED_DOMAINS]:
        return False, f"Only YouTube URLs are supported. Got: {hostname}"

    for pattern in YOUTUBE_URL_PATTERNS:
        if re.search(pattern, url, re.IGNORECASE):
            return True, ""

    return False, "URL does not appear to be a valid YouTube video or playlist URL"


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename."""
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = re.sub(r'\s+', '_', filename)
    filename = filename[:200]
    return filename or 'video'
