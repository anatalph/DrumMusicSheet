import {ImageResponse} from 'next/og';

export const alt = 'Add Lyrics to Charts';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

// Public-domain example: opening of "The Wellerman" (traditional sea
// shanty). Six syllables show the syllable-level granularity, with one
// multi-syllable word ("Wellerman") split across three cells.
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
          Add Lyrics to Charts
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
          Paste plain lyrics — they&rsquo;re automatically synced to the audio,
          syllable-by-syllable.
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 36px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
          }}>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}>
            Auto-aligned
          </div>
          <div style={{display: 'flex', gap: 36}}>
            {SAMPLE_SYLLABLES.map(([syl, time]) => (
              <div
                key={syl + time}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <div style={{display: 'flex', fontSize: 44, fontWeight: 600}}>
                  {syl}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: 'monospace',
                    marginTop: 8,
                  }}>
                  {time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
