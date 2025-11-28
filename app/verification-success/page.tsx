'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaEnvelopeOpenText, FaCheckCircle, FaTachometerAlt } from 'react-icons/fa';
import styles from './verification.module.css';

interface UserProfile {
    member_id: string;
    membership_status: string;
    created_at: string;
}

export default function VerificationSuccessPage() {
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');


    useEffect(() => {
        const checkVerification = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    throw new Error('User not authenticated');
                }

                // Check if email is verified
                if (!user.email_confirmed_at) {
                    throw new Error('Email not verified');
                }

                // Fetch user profile
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('member_id, membership_status, created_at')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                setUserProfile(profile);
                setVerified(true);
            } catch (err: any) {
                console.error('Verification check failed:', err);
                setError(err.message || 'Verification confirmation failed');
            } finally {
                setLoading(false);
            }
        };

        checkVerification();
    }, [supabase]);

    return (
        <div className={styles.container}>
            <div className={styles.icon}>
                <FaEnvelopeOpenText />
            </div>
            <h1>Email Verification Successful</h1>

            {loading && (
                <>
                    <div className={styles.spinner}></div>
                    <p>Processing your verification... Please wait.</p>
                </>
            )}

            {!loading && verified && (
                <>
                    <div className={`${styles.alert} ${styles.success}`}>
                        <FaCheckCircle />
                        <span>Email verified successfully!</span>
                    </div>

                    {userProfile && (
                        <div className={styles.membershipCard}>
                            <img
                                src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                                alt="Blitz T Club Logo"
                                className={styles.cardLogo}
                            />
                            <h2>Blitz T Club Member</h2>
                            <div className={styles.memberId}>
                                {userProfile.member_id}
                            </div>
                            <div className={styles.cardDetails}>
                                <p><strong>Status:</strong> <span>{userProfile.membership_status}</span></p>
                                <p><strong>Member Since:</strong> <span>{new Date(userProfile.created_at).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                    )}

                    <Link href="/dashboard" className={styles.dashboardBtn}>
                        <FaTachometerAlt /> Go to Dashboard
                    </Link>
                </>
            )}

            {!loading && error && (
                <div className={`${styles.alert} ${styles.error}`}>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
