
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaCheck, FaSpinner } from 'react-icons/fa';
import styles from './update-password.module.css';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const router = useRouter();

    useEffect(() => {
        // Check if we have a session (which happens after clicking the reset link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMessage({
                    text: 'Invalid or expired reset link. Please request a new password reset.',
                    type: 'error'
                });
            }
        };
        checkSession();
    }, [supabase.auth]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({
                text: 'Password updated successfully! Redirecting to login...',
                type: 'success'
            });

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Error updating password:', error);
            setMessage({
                text: error.message || 'Failed to update password. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <div className={styles.header}>
                    <img
                        src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png"
                        alt="Blitz Tesla Club Logo"
                        className={styles.logo}
                    />
                    <h2>Set New Password</h2>
                    <p>Please enter your new password below.</p>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">New Password</label>
                        <div className={styles.inputWrapper}>
                            <FaLock className={styles.inputIcon} />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className={styles.inputWrapper}>
                            <FaLock className={styles.inputIcon} />
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm new password"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="fa-spin" /> Updating...
                            </>
                        ) : (
                            <>
                                <FaCheck /> Update Password
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link href="/login">Return to Login</Link>
                </div>
            </div>
        </div>
    );
}
