export default function ProgressBar({ progress = 0, speed = '', eta = '', status = '' }) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {speed && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
              ↓ {speed}
            </span>
          )}
          {eta && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
              ETA {eta}
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="yt-progress-track">
        <div
          className="yt-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
