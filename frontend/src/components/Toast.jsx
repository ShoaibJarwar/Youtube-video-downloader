import { useApp } from '../context/AppContext';

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item ${t.type}`}
          style={{ cursor: 'pointer' }}
          onClick={() => removeToast(t.id)}
        >
          <span style={{ flexShrink: 0 }}>{ICONS[t.type] || 'ℹ'}</span>
          <span style={{ fontSize: 14 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
