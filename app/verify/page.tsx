'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import styles from './verify.module.css';

export default function VerifyPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleEmailVerification = async () => {
            try {
                // Check if user is authenticated after email verification
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    throw new Error('Failed to verify session');
                }

                if (session?.user) {
                    // User is verified! Check if profile is complete
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        console.error('Profile fetch error:', profileError);
                    }

                    // Update user's email_confirmed_at if needed
                    if (session.user.email_confirmed_at) {
                        setStatus('success');
                        setMessage('Email verified successfully! Redirecting to your dashboard...');

                        // Update membership status to active if it was pending
                        if (profile?.membership_status === 'pending') {
                            await supabase
                                .from('profiles')
                                .update({ membership_status: 'active' })
                                .eq('id', session.user.id);
                        }

                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 2000);
                    } else {
                        throw new Error('Email not confirmed yet');
                    }
                } else {
                    // No session - might need to wait for the redirect
                    setMessage('Completing verification...');

                    // Try refreshing the session
                    setTimeout(async () => {
                        const { data } = await supabase.auth.refreshSession();
                        if (data?.session) {
                            window.location.reload();
                        } else {
                            setStatus('error');
                            setMessage('Verification incomplete. Please try clicking the link in your email again.');
                        }
                    }, 3000);
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'Verification failed. Please try again or contact support.');
            }
        };

        handleEmailVerification();
    }, [router]);

    return (
        <div className={styles.verifyPage}>
            <div className={styles.verifyContainer}>
                <div className={styles.verifyBox}>
                    <div className={styles.iconWrapper}>
                        {status === 'verifying' && <FaSpinner className={`${styles.icon} ${styles.spin}`} />}
                        {status === 'success' && <FaCheckCircle className={`${styles.icon} ${styles.success}`} />}
                        {status === 'error' && <FaTimesCircle className={`${styles.icon} ${styles.error}`} />}
                    </div>

                    <h1>
                        {status === 'verifying' && 'Verifying Your Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    <p className={styles.message}>{message}</p>

                    {status === 'error' && (
                        <div className={styles.actions}>
                            <button
                                onClick={() => router.push('/login')}
                                className={styles.btn}
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={() => router.push('/contact')}
                                className={styles.btnSecondary}
                            >
                                Contact Support
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
