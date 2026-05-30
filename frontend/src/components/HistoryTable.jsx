import { getFileUrl } from '../services/api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function HistoryTable({ records, onDelete }) {
  if (!records?.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
      }}>
        No downloads yet
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Title', 'Quality', 'Format', 'Size', 'Status', 'Date', ''].map((h) => (
              <th key={h} style={{
                textAlign: 'left',
                padding: '10px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              style={{
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.thumbnail && (
                    <img
                      src={r.thumbnail}
                      alt=""
                      style={{ width: 48, height: 27, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div style={{
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 200,
                  }} title={r.title}>
                    {r.title || r.url}
                  </div>
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span className="badge-quality">{r.quality}</span>
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                {r.format?.toUpperCase()}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                {formatBytes(r.file_size)}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span className={`badge-status ${r.status}`}>{r.status}</span>
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(r.created_at)}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.status === 'completed' && (
                    <a
                      href={getFileUrl(r.id)}
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}
                    >
                      ↓
                    </a>
                  )}
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: '4px 10px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    onClick={() => onDelete(r.id)}
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
