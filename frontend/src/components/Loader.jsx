export default function Loader({ size = 40, label = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid var(--border)`,
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      {label && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          {label}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
