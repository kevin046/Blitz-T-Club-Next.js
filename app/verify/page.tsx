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
        let mounted = true;

        const handleUserVerified = async (user: any) => {
            try {
                // User is verified! Check if profile is complete
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                }

                // Update user's email_confirmed_at if needed
                if (user.email_confirmed_at) {
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to your dashboard...');

                    // Update membership status to active if it was pending
                    if (profile?.membership_status === 'pending') {
                        await supabase
                            .from('profiles')
                            .update({ membership_status: 'active' })
                            .eq('id', user.id);
                    }

                    // Redirect to dashboard after 2 seconds
                    setTimeout(() => {
                        if (mounted) router.push('/dashboard');
                    }, 2000);
                } else {
                    // Should not happen if redirected from email link
                    throw new Error('Email not confirmed yet');
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                if (mounted) {
                    setStatus('error');
                    setMessage(error.message || 'Verification failed. Please try again or contact support.');
                }
            }
        };

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user && mounted) {
                await handleUserVerified(session.user);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && mounted) {
                await handleUserVerified(session.user);
            }
        });

        checkSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
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
