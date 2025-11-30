import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '20px',
            color: 'var(--color-text-primary)'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                The page you are looking for does not exist.
            </p>
            <Link
                href="/"
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}
            >
                Return Home
            </Link>
        </div>
    );
}
