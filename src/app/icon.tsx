import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          fontFamily: 'sans-serif',
          border: '2px solid rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
          <span style={{ 
            color: '#262D33', 
            fontWeight: 800, 
            fontSize: '36px',
            letterSpacing: '-2px'
          }}>
            G
          </span>
          <span style={{ 
            color: '#B5952F', 
            fontWeight: 600, 
            fontSize: '32px',
            fontStyle: 'italic',
            marginLeft: '1px'
          }}>
            S
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
