'use client';

import { Providers } from '@/components/Providers';

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
                <Providers>
                    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                        <h2>Something went wrong!</h2>
                        <p>{error.message}</p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '10px 20px',
                                marginTop: '20px',
                                cursor: 'pointer'
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
