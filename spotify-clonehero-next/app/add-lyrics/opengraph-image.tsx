import {ImageResponse} from 'next/og';

export const alt = 'Add Lyrics to Charts';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

// Public-domain example: opening of "The Wellerman" (traditional sea
// shanty). One multi-syllable word ("Wellerman") split across three
// cells shows the syllable-level granularity at a glance.
const SAMPLE_SYLLABLES: ReadonlyArray<readonly [string, string]> = [
  ['Soon', '0:02.10'],
  ['may', '0:02.45'],
  ['the', '0:02.78'],
  ['Wel', '0:03.12'],
  ['ler', '0:03.42'],
  ['man', '0:03.74'],
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
          padding: '70px 80px',
        }}>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}>
          Music Charts Tools
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 28,
          }}>
          Add Lyrics to Charts
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 42,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 1040,
            lineHeight: 1.25,
            marginBottom: 48,
          }}>
          Paste lyrics — auto-synced to any chart, syllable by syllable.
        </div>
        <div
          style={{
            display: 'flex',
            padding: '32px 44px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            gap: 36,
          }}>
          {SAMPLE_SYLLABLES.map(([syl, time]) => (
            <div
              key={syl + time}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <div style={{display: 'flex', fontSize: 64, fontWeight: 600}}>
                {syl}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'monospace',
                  marginTop: 10,
                }}>
                {time}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
