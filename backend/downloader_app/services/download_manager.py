import threading
from django.utils import timezone
from ..utils.logger import get_logger
from .ytdlp_service import download_video

logger = get_logger('download_manager')

# In-memory task registry (augments DB)
_active_tasks = {}
_task_lock = threading.Lock()


def start_download(task_id: str, url: str, quality: str, fmt: str, output_dir: str):
    """Launch download in background thread."""
    thread = threading.Thread(
        target=_download_worker,
        args=(task_id, url, quality, fmt, output_dir),
        daemon=True,
        name=f'download-{task_id[:8]}'
    )
    with _task_lock:
        _active_tasks[task_id] = {'thread': thread, 'cancelled': False}
    thread.start()
    logger.info(f"Started download task {task_id}")


def cancel_download(task_id: str) -> bool:
    with _task_lock:
        task = _active_tasks.get(task_id)
        if task:
            task['cancelled'] = True
            return True
    return False


def is_cancelled(task_id: str) -> bool:
    with _task_lock:
        task = _active_tasks.get(task_id)
        return task.get('cancelled', False) if task else False


def cleanup_task(task_id: str):
    with _task_lock:
        _active_tasks.pop(task_id, None)


def _download_worker(task_id: str, url: str, quality: str, fmt: str, output_dir: str):
    """Background worker for downloading."""
    # Import here to avoid circular imports
    from ..models import DownloadHistory

    try:
        record = DownloadHistory.objects.get(id=task_id)
        record.status = 'downloading'
        record.save(update_fields=['status'])

        def progress_callback(progress, speed, eta, status):
            if is_cancelled(task_id):
                raise InterruptedError("Download cancelled by user")
            try:
                DownloadHistory.objects.filter(id=task_id).update(
                    progress=round(progress, 1),
                    download_speed=speed,
                    eta=eta,
                    status=status,
                )
            except Exception as e:
                logger.error(f"Progress update failed: {e}")

        file_path = download_video(url, quality, fmt, output_dir, task_id, progress_callback)

        import os
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else None

        DownloadHistory.objects.filter(id=task_id).update(
            status='completed',
            progress=100.0,
            file_path=file_path,
            file_size=file_size,
            download_speed='',
            eta='',
            completed_at=timezone.now(),
        )
        logger.info(f"Task {task_id} completed: {file_path}")

    except InterruptedError:
        DownloadHistory.objects.filter(id=task_id).update(
            status='cancelled',
            error_message='Download cancelled by user',
        )
        logger.info(f"Task {task_id} cancelled")
    except Exception as e:
        logger.error(f"Task {task_id} failed: {e}")
        DownloadHistory.objects.filter(id=task_id).update(
            status='failed',
            error_message=str(e),
        )
    finally:
        cleanup_task(task_id)
