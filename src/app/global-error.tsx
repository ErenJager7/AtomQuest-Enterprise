'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '40px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Catastrophic System Failure</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6' }}>
              The application encountered an unrecoverable error at the root level.
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Force Restart
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre style={{ 
                marginTop: '32px', 
                padding: '16px', 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                borderRadius: '8px',
                color: '#f43f5e',
                fontSize: '12px',
                textAlign: 'left',
                overflowX: 'auto'
              }}>
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
