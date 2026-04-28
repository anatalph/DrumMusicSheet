/**
 * Default OG image for Music Charts Tools.
 *
 * Applies to every route under app/ that doesn't define its own
 * `opengraph-image.tsx`. Generated at request time via Next's
 * ImageResponse (no static asset to keep in sync), so the same file
 * also serves Twitter when paired with `twitter-image.tsx`.
 */
import {ImageResponse} from 'next/og';

export const alt = 'Music Charts Tools';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1a0a1f 0%, #2c0e36 50%, #0a0a14 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            marginBottom: 24,
          }}>
          Music Charts Tools
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: '85%',
          }}>
          Tools for finding, viewing, and working with Clone Hero charts
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 56,
            fontSize: 24,
            color: 'rgba(255,255,255,0.65)',
          }}>
          <div style={{display: 'flex'}}>
            <span style={{color: 'white', fontWeight: 600}}>
              Spotify Chart Finder
            </span>
            <span style={{margin: '0 12px', opacity: 0.4}}>—</span>
            <span>find songs you know from Spotify</span>
          </div>
          <div style={{display: 'flex'}}>
            <span style={{color: 'white', fontWeight: 600}}>
              Drum Sheet Music
            </span>
            <span style={{margin: '0 12px', opacity: 0.4}}>—</span>
            <span>view drum charts as sheet music</span>
          </div>
          <div style={{display: 'flex'}}>
            <span style={{color: 'white', fontWeight: 600}}>
              Lyric Alignment
            </span>
            <span style={{margin: '0 12px', opacity: 0.4}}>—</span>
            <span>add lyrics to charts</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
