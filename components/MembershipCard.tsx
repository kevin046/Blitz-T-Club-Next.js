'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../app/dashboard/dashboard.module.css';

interface UserProfile {
    id: string;
    full_name: string;
    member_id?: string;
    membership_type: string;
    role?: string;
    created_at: string;
    [key: string]: any;
}

interface MembershipCardProps {
    profile: UserProfile;
}

export default function MembershipCard({ profile }: MembershipCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (profile && canvasRef.current) {
            // Generate QR Code content: Verification URL with User ID
            // Using the new Next.js route structure (no .html extension)
            // When scanned, this will open: https://www.blitztclub.com/verify-member?member_id=...
            const origin = 'https://www.blitztclub.com';
            const verificationUrl = `${origin}/verify-member?member_id=${profile.id}`;

            QRCode.toCanvas(canvasRef.current, verificationUrl, {
                width: 120,
                margin: 0,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            }, (error) => {
                if (error) {
                    console.error('Error generating QR code:', error);
                }
            });
        }
    }, [profile]);

    if (!profile) return null;

    const isPremium = profile.membership_type === 'premium';
    const isAdmin = profile.role === 'admin' || profile.membership_type === 'admin';

    // Format Member Since Year (2 digits)
    const memberSinceYear = profile.created_at
        ? new Date(profile.created_at).getFullYear().toString().slice(-2)
        : new Date().getFullYear().toString().slice(-2);

    return (
        <div className={styles.membershipCardWrapper} onClick={() => setIsFlipped(!isFlipped)}>
            <div
                className={`${styles.membershipCard} ${isFlipped ? styles.flipped : ''} ${isAdmin ? styles.admin : (isPremium ? styles.premium : '')}`}
                data-type={isAdmin ? 'admin' : (isPremium ? 'premium' : 'standard')}
            >
                {/* FRONT FACE */}
                <div className={styles.cardFront}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerText}>
                            <h2>{isAdmin ? 'ADMIN' : (isPremium ? 'VIP MEMBER' : 'CLUB MEMBER')}</h2>
                        </div>
                    </div>

                    <div className={styles.centerLogoContainer}>
                        <img
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                            alt="Blitz Tesla Club Logo"
                            className={styles.centerLogo}
                            suppressHydrationWarning
                        />
                    </div>

                    <div className={styles.cardChip}></div>

                    <div className={styles.memberDetails}>
                        <div className={styles.memberName}>
                            <h3>{profile.full_name}</h3>
                        </div>
                        <div className={styles.memberSince}>
                            <span className={styles.memberId}>{profile.member_id || 'N/A'}</span>
                            <span className={styles.memberSinceLabel}>MEMBER SINCE</span>
                            <span className={styles.memberSinceValue}>{memberSinceYear}</span>
                        </div>
                    </div>
                </div>

                {/* BACK FACE */}
                <div className={styles.cardBack}>
                    <div className={styles.magneticStripe}></div>
                    <div className={styles.signatureStrip}>{profile.member_id || 'AUTHORIZED SIGNATURE'}</div>

                    <div className={styles.qrContainer}>
                        <canvas ref={canvasRef} className={styles.qrCode}></canvas>
                    </div>

                    <div className={styles.cardBackText}>
                        Scan to Verify Membership
                    </div>
                </div>
            </div>
        </div>
    );
}
