export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 0',
      marginTop: 80,
    }}>
      <div className="container-xl" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              YT<span style={{ color: 'var(--accent)' }}>Vault</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              For educational purposes only. Respect YouTube ToS.
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Built with yt-dlp + FFmpeg + Django + React
          </div>
        </div>
      </div>
    </footer>
  );
}
