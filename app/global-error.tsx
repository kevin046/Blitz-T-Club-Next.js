'use client';

import { Providers } from '@/components/Providers';
import "./globals.css";

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
                <Providers>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '20px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-inter, sans-serif)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
                        <p style={{ marginBottom: '2rem', color: 'red' }}>{error.message}</p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
