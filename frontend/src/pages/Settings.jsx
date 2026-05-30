import { useApp } from '../context/AppContext';

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid var(--border)',
      gap: 24,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function Settings() {
  const { darkMode, toggleDarkMode, addToast } = useApp();

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="section-label">Configuration</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Settings</h2>
      </div>

      {/* Appearance */}
      <div className="yt-card" style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ padding: '16px 0 8px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Appearance
        </div>
        <SettingRow label="Dark Mode" description="Use dark theme throughout the app">
          <button
            onClick={toggleDarkMode}
            style={{
              width: 52, height: 28,
              borderRadius: 14,
              border: 'none',
              background: darkMode ? 'var(--accent)' : 'var(--border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 3, left: darkMode ? 27 : 3,
              width: 22, height: 22,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
        </SettingRow>
      </div>

      {/* Download Defaults */}
      <div className="yt-card" style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ padding: '16px 0 8px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Download Defaults
        </div>
        <SettingRow label="Default Quality" description="Quality used when starting downloads">
          <select className="yt-input" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Format" description="Output format for downloads">
          <select className="yt-input" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
            <option value="mp4">MP4 Video</option>
            <option value="mp3">MP3 Audio</option>
          </select>
        </SettingRow>
      </div>

      {/* Info */}
      <div className="yt-card" style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ padding: '16px 0 8px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          About
        </div>
        <SettingRow label="Version" description="YTVault application version">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>1.0.0</span>
        </SettingRow>
        <SettingRow label="Backend" description="API and download engine">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>Django + yt-dlp</span>
        </SettingRow>
        <SettingRow label="License" description="For educational purposes only">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>Educational</span>
        </SettingRow>
      </div>

      <button
        className="btn-accent"
        onClick={() => addToast('Settings saved', 'success')}
      >
        Save Settings
      </button>
    </div>
  );
}
