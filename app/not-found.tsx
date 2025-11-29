import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #e82127 0%, #171a20 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: '600'
                }}
            >
                Return Home
            </Link>
        </div>
    );
}
