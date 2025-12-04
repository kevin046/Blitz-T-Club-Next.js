'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import styles from './verify.module.css';

export default function VerifyEmail() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleEmailVerification = async () => {
            try {
                // Check if we have a session from the verification link
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    throw new Error('Failed to verify session');
                }

                if (!session) {
                    // Check BOTH URL hash AND query parameters for tokens
                    // (Supabase can use either depending on configuration)
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const queryParams = new URLSearchParams(window.location.search);

                    let accessToken = hashParams.get('access_token') || queryParams.get('access_token');
                    let refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
                    const error = hashParams.get('error') || queryParams.get('error');
                    const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
                    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
                    const token_hash = hashParams.get('token_hash') || queryParams.get('token_hash');
                    const type = hashParams.get('type') || queryParams.get('type');

                    console.log('Verification tokens:', {
                        hasAccessToken: !!accessToken,
                        hasRefreshToken: !!refreshToken,
                        hasTokenHash: !!token_hash,
                        type,
                        error,
                        errorCode
                    });

                    // Handle errors from Supabase
                    if (error || errorCode) {
                        console.error('Auth error from URL:', { error, errorCode, errorDescription });

                        // Redirect to error page
                        const errorParams = new URLSearchParams();
                        if (error) errorParams.set('error', error);
                        if (errorCode) errorParams.set('error_code', errorCode);
                        if (errorDescription) errorParams.set('error_description', errorDescription);

                        router.push(`/auth/error?${errorParams.toString()}`);
                        return;
                    }

                    // Try to verify using token_hash if present (new Supabase method)
                    if (token_hash && type) {
                        const { error: verifyError } = await supabase.auth.verifyOtp({
                            token_hash,
                            type: type as any,
                        });

                        if (verifyError) {
                            throw verifyError;
                        }
                    }
                    // Otherwise use access/refresh tokens if available
                    else if (accessToken && refreshToken) {
                        const { error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (setSessionError) {
                            throw setSessionError;
                        }
                    } else {
                        throw new Error('No verification tokens found. Please click the verification link in your email or request a new one.');
                    }
                }

                // Get the current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    throw new Error('Failed to get user information');
                }

                // Update membership status to active
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        membership_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (updateError) {
                    console.error('Update error:', updateError);
                    // Don't throw - verification still succeeded
                }

                setStatus('success');
                setMessage('✅ Your email has been verified successfully! Redirecting to dashboard...');

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);

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
                        {status === 'loading' && <FaSpinner className={`${styles.icon} ${styles.spin}`} />}
                        {status === 'success' && <FaCheckCircle className={`${styles.icon} ${styles.success}`} />}
                        {status === 'error' && <FaTimesCircle className={`${styles.icon} ${styles.error}`} />}
                    </div>

                    <h2>
                        {status === 'loading' && 'Verifying Your Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h2>

                    <p>{message}</p>

                    {status === 'error' && (
                        <div className={styles.actions}>
                            <button onClick={() => router.push('/login')} className={styles.btn}>
                                Go to Login
                            </button>
                            <button onClick={() => router.push('/register')} className={styles.btn}>
                                Register Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
