'use client';

import Link from 'next/link';
import { FaEnvelope, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './success.module.css';

export default function RegistrationSuccess() {
    const { theme } = useTheme();

    return (
        <div className={styles.successPage}>
            <div className={styles.successContainer}>
                <div className={styles.successBox}>
                    <div className={styles.iconWrapper}>
                        <FaEnvelope className={styles.mainIcon} />
                        <div className={styles.checkBadge}>
                            <FaCheckCircle />
                        </div>
                    </div>

                    <h1>Check Your Email</h1>

                    <div className={styles.messageContent}>
                        <p className={styles.primaryMessage}>
                            We've sent a verification link to your email address.
                        </p>

                        <p className={styles.secondaryMessage}>
                            Please click the link in the email to verify your account and access your dashboard.
                        </p>

                        <div className={styles.spamNotice}>
                            <h3>📧 Didn't receive it?</h3>
                            <ul>
                                <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder</li>
                                <li>Wait a few minutes</li>
                                <li>Add <strong>noreply@blitztclub.com</strong> to your contacts</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/login" className={styles.loginBtn}>
                            Return to Login <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
