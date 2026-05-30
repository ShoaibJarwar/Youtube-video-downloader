import { useState } from 'react';
import DownloadForm from '../components/DownloadForm';
import VideoCard from '../components/VideoCard';

export default function Home() {
  const [videoData, setVideoData] = useState(null); // { url, info }

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '64px 24px 48px',
        position: 'relative',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse at center top, rgba(255,60,60,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 20,
        }}>
          YouTube Downloader
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 20,
          letterSpacing: '-0.03em',
        }}>
          Download anything.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Keep it forever.
          </span>
        </h1>

        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 520,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          HD videos and MP3 audio from YouTube. Fast, free, no limits.
        </p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {!videoData ? (
          <DownloadForm onVideoInfo={(url, info) => setVideoData({ url, info })} />
        ) : (
          <VideoCard
            url={videoData.url}
            info={videoData.info}
            onReset={() => setVideoData(null)}
          />
        )}

        {/* Feature pills */}
        {!videoData && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 48 }}>
            {[
              ['▶', 'HD Video', '360p — 1080p'],
              ['♪', 'MP3 Audio', '192kbps'],
              ['◈', 'Playlist', 'Multi-video'],
              ['⟳', 'Progress', 'Real-time'],
              ['⏱', 'Fast', 'FFmpeg merge'],
            ].map(([icon, label, sub]) => (
              <div key={label} className="yt-card" style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flex: '1 0 140px',
                maxWidth: 180,
              }}>
                <div style={{ fontSize: 20, color: 'var(--accent)' }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
