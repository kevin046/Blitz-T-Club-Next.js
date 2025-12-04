'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import styles from './auth-error.module.css';

function AuthErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    const getErrorMessage = () => {
        if (errorCode === 'otp_expired') {
            return 'Your email verification link has expired.';
        }
        if (error === 'access_denied') {
            return 'Access was denied. The link may be invalid or expired.';
        }
        return errorDescription || 'An authentication error occurred.';
    };

    const handleResendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            setMessage('✅ A new verification email has been sent! Please check your inbox.');
        } catch (err: any) {
            setMessage(`❌ ${err.message || 'Failed to resend email'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.icon}>⚠️</div>
            <h1 className={styles.title}>Authentication Error</h1>
            <p className={styles.errorMessage}>{getErrorMessage()}</p>

            {errorCode === 'otp_expired' && (
                <div className={styles.resendSection}>
                    <p className={styles.instruction}>
                        Enter your email address to receive a new verification link:
                    </p>
                    <form onSubmit={handleResendEmail} className={styles.form}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className={styles.input}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.button}
                        >
                            {loading ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </form>
                    {message && <p className={styles.message}>{message}</p>}
                </div>
            )}

            <div className={styles.actions}>
                <button onClick={() => router.push('/login')} className={styles.linkButton}>
                    Go to Login
                </button>
                <button onClick={() => router.push('/register')} className={styles.linkButton}>
                    Create New Account
                </button>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className={styles.container}>
            <Suspense fallback={
                <div className={styles.card}>
                    <div className={styles.icon}>⏳</div>
                    <h1 className={styles.title}>Loading...</h1>
                </div>
            }>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
