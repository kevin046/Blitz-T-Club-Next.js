
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import styles from './verify.module.css';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email'); // For display purposes if token is missing

        if (!token) {
            if (email) {
                setStatus('loading');
                setMessage(`Please check your email (${email}) for the verification link.`);
                return;
            }
            setStatus('error');
            setMessage('Invalid verification link. Please check your email and try again.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Verification failed');
                }

                setStatus('success');
                setMessage('Your email has been verified successfully! You can now log in.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message);
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className={styles.verifyBox}>
            <div className={styles.iconWrapper}>
                {status === 'loading' && <FaSpinner className={`${styles.icon} ${styles.spin}`} />}
                {status === 'success' && <FaCheckCircle className={`${styles.icon} ${styles.success}`} />}
                {status === 'error' && <FaTimesCircle className={`${styles.icon} ${styles.error}`} />}
            </div>

            <h2>
                {status === 'loading' && 'Verifying...'}
                {status === 'success' && 'Verified!'}
                {status === 'error' && 'Verification Failed'}
            </h2>

            <p>{message}</p>

            {status === 'success' && (
                <Link href="/login" className={styles.btn}>
                    Go to Login
                </Link>
            )}

            {status === 'error' && (
                <Link href="/contact" className={styles.btn}>
                    Contact Support
                </Link>
            )}
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <div className={styles.verifyPage}>
            <div className={styles.verifyContainer}>
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
