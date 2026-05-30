import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useApp();
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Download' },
    { to: '/history', label: 'History' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <nav style={{
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="container-xl" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>▶</div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              YT<span style={{ color: 'var(--accent)' }}>Vault</span>
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: pathname === to ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: pathname === to ? 'var(--border)' : 'transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
