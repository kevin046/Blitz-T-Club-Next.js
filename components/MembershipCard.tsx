'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from '../app/dashboard/dashboard.module.css';

interface MembershipCardProps {
    profile: any;
}

export default function MembershipCard({ profile }: MembershipCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (profile && canvasRef.current) {
            // Generate QR Code content: Member ID + Verification Token (if any) or just Member ID
            const qrContent = JSON.stringify({
                id: profile.id,
                memberId: profile.member_id,
                type: profile.membership_type,
                email: profile.email
            });

            QRCode.toCanvas(canvasRef.current, qrContent, {
                width: 120,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            }, (error) => {
                if (error) console.error('Error generating QR code:', error);
            });
        }
    }, [profile]);

    if (!profile) return null;

    const isPremium = profile.membership_type === 'premium';

    return (
        <div className={`${styles.membershipCard} ${isPremium ? styles.premium : ''}`} data-type={profile.membership_type}>
            <div className={styles.cardBg}></div>
            <div className={styles.cardChip}></div>
            <div className={styles.cardHologram}></div>
            <div className={styles.cardHeader}>
                <img
                    src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                    alt="Blitz Tesla Club Logo"
                    className={styles.cardLogo}
                    suppressHydrationWarning
                />
                <div className={styles.headerText}>
                    <h2>{isPremium ? 'VIP MEMBER' : 'CLUB MEMBER'}</h2>
                </div>
            </div>

            <div className={styles.memberInfo}>
                <h3>{profile.full_name}</h3>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Member ID</span>
                    <span className={styles.value} id="memberId">{profile.member_id || 'Pending'}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Member Since</span>
                    <span className={styles.value}>{new Date(profile.created_at).getFullYear()}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Status</span>
                    <span className={styles.value} style={{ color: '#00e676', fontWeight: 600 }}>Active</span>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.qrSection}>
                    <canvas ref={canvasRef} className={styles.qrCode}></canvas>
                    <div className={styles.qrText}>
                        <span>Scan for Event Entry</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
