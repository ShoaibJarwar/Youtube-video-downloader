import { useState, useCallback } from 'react';
import { analyzeUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import Loader from './Loader';

export default function DownloadForm({ onVideoInfo }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useApp();

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      addToast('Clipboard access denied', 'warning');
    }
  }, [addToast]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a YouTube URL');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await analyzeUrl(trimmed);
      onVideoInfo(trimmed, data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [url, onVideoInfo, addToast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text');
    if (text) setUrl(text);
  }, []);

  return (
    <div
      className="yt-card"
      style={{ padding: '32px', marginBottom: 32 }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="section-label">YouTube URL</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 8, marginBottom: error ? 8 : 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, pointerEvents: 'none', opacity: 0.4,
            }}>▶</span>
            <input
              className="yt-input"
              style={{ paddingLeft: 44 }}
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handlePaste}
            disabled={loading}
            title="Paste from clipboard"
          >
            Paste
          </button>
          <button
            className="btn-accent"
            type="submit"
            disabled={loading || !url.trim()}
          >
            {loading ? <Loader size={18} /> : 'Analyze'}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: 13, color: '#ef4444', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
            ⚠ {error}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Paste a URL or drag-and-drop from your browser • Supports videos, playlists &amp; shorts
        </div>
      </form>
    </div>
  );
}
