'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    fontFamily: 'Arial, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh'
                }}>
                    <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>Something went wrong!</h2>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '12px 24px',
                            marginTop: '20px',
                            cursor: 'pointer',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}