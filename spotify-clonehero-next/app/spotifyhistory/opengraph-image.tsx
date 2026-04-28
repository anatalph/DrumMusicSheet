import {ImageResponse} from 'next/og';

export const alt = 'Spotify History Chart Finder';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

const SPOTIFY_GREEN = '#1DB954';

// Traditional folk + a classical piece. All compositions are public
// domain; modern hit covers across different eras make them feel
// recognizable rather than dusty.
const SAMPLE_HISTORY: ReadonlyArray<readonly [string, string]> = [
  ['Scarborough Fair', 'Traditional'],
  ['Cotton Eye Joe', 'Traditional'],
  ['Wayfaring Stranger', 'Traditional'],
  ['Flight of the Bumblebee', 'Rimsky-Korsakov'],
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
          padding: '64px 80px',
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
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 20,
          }}>
          Spotify History Chart Finder
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 980,
            lineHeight: 1.3,
            marginBottom: 40,
          }}>
          Find Clone Hero charts for every song you&rsquo;ve ever listened to
          on Spotify.
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 30px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
            gap: 12,
          }}>
          {SAMPLE_HISTORY.map(([song, artist]) => (
            <div
              key={song}
              style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: SPOTIFY_GREEN,
                }}>
                <svg width="14" height="14" viewBox="0 0 14 14">
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
                style={{display: 'flex', fontSize: 26, fontWeight: 600}}>
                {song}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.55)',
                }}>
                {artist}
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 4,
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 13,
                border: '1px dashed rgba(255,255,255,0.35)',
                color: 'rgba(255,255,255,0.55)',
                fontSize: 16,
                fontWeight: 700,
              }}>
              +
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: 'rgba(255,255,255,0.55)',
              }}>
              and thousands more from your listening history
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
