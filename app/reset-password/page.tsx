
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaPaperPlane, FaCheck, FaSpinner } from 'react-icons/fa';
import styles from './reset-password.module.css';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [emailSent, setEmailSent] = useState(false);


    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                throw error;
            }

            setEmailSent(true);
            setMessage({
                text: `Password reset email sent to ${email}! Please check your inbox and spam folder.`,
                type: 'success',
            });
        } catch (error: any) {
            console.error('Password reset error:', error);
            setMessage({
                text: error.message || 'Failed to send reset email. Please try again later.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.resetContainer}>
            <div className={styles.resetBox}>
                <div className={styles.resetHeader}>
                    <img
                        src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png"
                        alt="Blitz Tesla Club Logo"
                        className={styles.resetLogo}
                    />
                    <h2>Reset Password</h2>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className={styles.resetForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email address"
                            autoComplete="email"
                            disabled={emailSent || loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.resetBtn}
                        disabled={emailSent || loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="fa-spin" /> Sending...
                            </>
                        ) : emailSent ? (
                            <>
                                <FaCheck /> Email Sent
                            </>
                        ) : (
                            <>
                                <FaPaperPlane /> Send Reset Link
                            </>
                        )}
                    </button>

                    <div className={styles.formFooter}>
                        <Link href="/login">Return to Login</Link>
                    </div>
                </form>

                {emailSent && (
                    <div className={styles.resetInstructions}>
                        <p><strong>Next steps:</strong></p>
                        <ol>
                            <li>Check your email for a message from Supabase</li>
                            <li>Click the password reset link in the email</li>
                            <li>Create your new password on the page that opens</li>
                        </ol>
                        <p>The reset link will expire in 24 hours.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
