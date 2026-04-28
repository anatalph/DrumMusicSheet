import {ImageResponse} from 'next/og';

export const alt = 'Spotify Chart Finder';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

const SPOTIFY_GREEN = '#1DB954';

// Made-up, whimsical-feeling playlist names with realistic match
// counts. The 2000s rock one finds every song — illustrates the
// best-case outcome alongside two partial-match playlists.
const SAMPLE_PLAYLISTS: ReadonlyArray<
  readonly [string, number, number]
> = [
  ['treadmill bangers', 38, 45],
  ['synth dreams', 27, 34],
  ['y2k rock forever', 50, 50],
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #1a0a1f 0%, #2c0e36 50%, #0a0a14 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '72px 80px',
        }}>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
          Music Charts Tools
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 22,
          }}>
          Spotify Chart Finder
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 940,
            lineHeight: 1.3,
            marginBottom: 56,
          }}>
          Scan your Spotify playlists for songs with Clone Hero charts.
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 32px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
            gap: 14,
          }}>
          {SAMPLE_PLAYLISTS.map(([playlist, found, total]) => (
            <div
              key={playlist}
              style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: SPOTIFY_GREEN,
                }}>
                <svg width="16" height="16" viewBox="0 0 14 14">
                  <path
                    d="M3 7 L6 10 L11 4"
                    fill="none"
                    stroke="#0a0a14"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  fontWeight: 600,
                  flex: 1,
                }}>
                {playlist}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.6)',
                }}>
                <span style={{color: 'white', fontWeight: 600}}>{found}</span>
                <span style={{margin: '0 4px', opacity: 0.5}}>/</span>
                <span>{total}</span>
                <span style={{marginLeft: 8}}>charts found</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
