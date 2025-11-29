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
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Something went wrong!</h1>
                    <p style={{ marginBottom: '2rem', color: '#666' }}>
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #e82127 0%, #171a20 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
