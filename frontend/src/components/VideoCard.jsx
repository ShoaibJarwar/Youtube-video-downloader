import { useState, useEffect, useCallback } from 'react';
import { startDownload, getProgress, cancelDownload, getFileUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import ProgressBar from './ProgressBar';

function formatDuration(secs) {
  if (!secs) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

export default function VideoCard({ url, info, onReset }) {
  const [quality, setQuality] = useState(info.available_qualities?.includes('720p') ? '720p' : (info.available_qualities?.[0] || '720p'));
  const [format, setFormat] = useState('mp4');
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [polling, setPolling] = useState(false);
  const { addToast, updateDownload, removeDownload } = useApp();

  const handleDownload = useCallback(async () => {
    try {
      const res = await startDownload(url, quality, format);
      setTaskId(res.task_id);
      setPolling(true);
      addToast(`Download started: ${info.title?.slice(0, 40)}`, 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }, [url, quality, format, info.title, addToast]);

  const handleCancel = useCallback(async () => {
    if (!taskId) return;
    try {
      await cancelDownload(taskId);
      addToast('Download cancelled', 'warning');
      setPolling(false);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }, [taskId, addToast]);

  useEffect(() => {
    if (!polling || !taskId) return;
    let timer;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const data = await getProgress(taskId);
        if (stopped) return;
        setProgress(data);
        updateDownload(taskId, data);

        const terminal = ['completed', 'failed', 'cancelled'];
        if (terminal.includes(data.status)) {
          // Terminal state — stop polling immediately
          setPolling(false);
          if (data.status === 'completed') addToast('Download complete! ✓', 'success');
          if (data.status === 'failed') addToast(`Failed: ${data.error_message}`, 'error');
        } else {
          // Still in progress — poll every 2 seconds (stays well under rate limit)
          timer = setTimeout(poll, 2000);
        }
      } catch (err) {
        if (stopped) return;
        // On 429 back off to 5 seconds, otherwise retry at 3 seconds
        const delay = err?.message?.includes('429') ? 5000 : 3000;
        timer = setTimeout(poll, delay);
      }
    };

    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [polling, taskId, updateDownload, addToast]);

  const isActive = polling || (progress && ['downloading', 'processing', 'analyzing', 'pending'].includes(progress?.status));
  const isDone = progress?.status === 'completed';
  const isFailed = progress?.status === 'failed';

  return (
    <div className="yt-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
      {/* Thumbnail + info */}
      <div style={{ display: 'flex', gap: 24, padding: 24, flexWrap: 'wrap' }}>
        {/* Thumbnail */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <img
            src={info.thumbnail}
            alt={info.title}
            style={{
              width: 240,
              height: 135,
              objectFit: 'cover',
              borderRadius: 8,
              display: 'block',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {info.duration && (
            <div style={{
              position: 'absolute', bottom: 6, right: 6,
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              {formatDuration(info.duration)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
              {info.title}
            </div>
            {info.uploader && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{info.uploader}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {info.available_qualities?.map((q) => (
              <span key={q} className="badge-quality">{q}</span>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
              MP4 · MP3
            </span>
          </div>

          {/* Controls */}
          {!isActive && !isDone && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Quality selector */}
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                {(info.available_qualities || ['360p', '480p', '720p', '1080p']).map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
                <option value="best">Best</option>
              </select>

              {/* Format selector */}
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                <option value="mp4">MP4 Video</option>
                <option value="mp3">MP3 Audio</option>
              </select>

              <button className="btn-accent" onClick={handleDownload}>
                ↓ Download
              </button>

              <button className="btn-ghost" onClick={onReset}>
                ✕ Clear
              </button>
            </div>
          )}

          {/* Active download */}
          {isActive && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <ProgressBar
                  progress={progress?.progress || 0}
                  speed={progress?.download_speed}
                  eta={progress?.eta}
                  status={progress?.status}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge-status ${progress?.status || 'pending'}`}>
                  {progress?.status || 'pending'}
                </span>
                <button className="btn-ghost" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {isDone && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge-status completed">✓ Completed</span>
              <a
                href={getFileUrl(taskId)}
                className="btn-accent"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                ↓ Save File
              </a>
              <button className="btn-ghost" onClick={onReset}>
                New Download
              </button>
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge-status failed">✕ Failed</span>
              <div style={{ fontSize: 13, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                {progress?.error_message}
              </div>
              <button className="btn-ghost" onClick={onReset}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
