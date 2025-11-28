'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';
import styles from './verification-failed.module.css';

export default function VerificationFailedPage() {
    const [errorMessage, setErrorMessage] = useState('Verification process failed. Please try again.');

    useEffect(() => {
        // Get error message from sessionStorage if available
        const storedError = sessionStorage.getItem('verificationError');
        if (storedError) {
            setErrorMessage(storedError);
            sessionStorage.removeItem('verificationError');
        }
    }, []);

    return (
        <div className={styles.container}>
            <img
                src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png"
                alt="Blitz Tesla Club Logo"
                className={styles.logo}
            />
            <div className={styles.content}>
                <FaExclamationCircle className={styles.icon} />
                <div className={styles.failedContent}>
                    <h1>Verification Failed</h1>
                    <div className={styles.errorMessage}>{errorMessage}</div>
                    <p>Please try the following:</p>
                    <ul>
                        <li>Check if you're using the most recent verification link</li>
                        <li>Make sure you're using the same device you registered from</li>
                        <li>Request a new verification email</li>
                    </ul>
                    <div className={styles.actions}>
                        <Link href="/register" className={styles.btn}>Register Again</Link>
                        <Link href="/login" className={styles.btn}>Go to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
