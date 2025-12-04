'use client';

import { FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '@/lib/supabase/client';
import styles from './email-verification.module.css';

interface EmailVerificationScreenProps {
    userEmail: string;
    onSignOut: () => void;
}

export default function EmailVerificationScreen({ userEmail, onSignOut }: EmailVerificationScreenProps) {
    const handleResend = async () => {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: userEmail,
            });
            if (error) throw error;
            alert('✅ Verification email sent! Please check your inbox and spam folder.');
        } catch (err: any) {
            alert('❌ Failed: ' + err.message);
        }
    };

    return (
        <div className={styles.verificationPage}>
            <div className={styles.verificationCard}>
                <div className={styles.icon}>📧</div>
                <h1>Email Verification Required</h1>
                <p>Please verify your email to access your dashboard.</p>
                <p className={styles.emailText}>
                    Verification link sent to: <strong>{userEmail}</strong>
                </p>

                <button className={styles.resendBtn} onClick={handleResend}>
                    Resend Verification Email
                </button>

                <div className={styles.helpBox}>
                    <p><strong>Didn't receive the email?</strong></p>
                    <ul>
                        <li>Check your <strong>Spam/Junk</strong> folder</li>
                        <li>Wait a few minutes and try again</li>
                        <li>Make sure your email is correct</li>
                    </ul>
                </div>

                <button className={styles.logoutBtn} onClick={onSignOut}>
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>
        </div>
    );
}
