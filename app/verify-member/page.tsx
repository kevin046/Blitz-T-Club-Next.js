'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUser, FaIdCard, FaStore, FaQrcode } from 'react-icons/fa';
import styles from './verify-member.module.css';

interface MemberProfile {
    id: string;
    full_name: string;
    member_id: string;
    membership_type: string;
    membership_status: string;
    vehicle_model?: string;
    car_models?: string[];
    created_at: string;
    avatar_url?: string;
}

function VerifyMemberContent() {
    const searchParams = useSearchParams();
    const memberIdParam = searchParams.get('member_id');
    
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [member, setMember] = useState<MemberProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyMember = async () => {
            if (!memberIdParam) {
                setLoading(false);
                setError('No member ID provided');
                return;
            }

            try {
                // Fetch member profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', memberIdParam)
                    .single();

                if (error) throw error;

                if (data) {
                    setMember(data);
                    // Check if membership is active
                    if (data.membership_status === 'active' || data.membership_status === 'approved') {
                        setValid(true);
                    } else {
                        setValid(false);
                        setError(`Membership is ${data.membership_status}`);
                    }
                } else {
                    setValid(false);
                    setError('Member not found');
                }
            } catch (err: any) {
                console.error('Verification error:', err);
                setValid(false);
                setError('Invalid member ID or network error');
            } finally {
                setLoading(false);
            }
        };

        verifyMember();
    }, [memberIdParam]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.verificationCard}>
                    <div className={styles.header}>
                        <img 
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png" 
                            alt="Blitz Tesla Club" 
                            className={styles.logo} 
                        />
                        <h1>Verifying Member...</h1>
                    </div>
                    <div className={`${styles.statusBanner} ${styles.loading}`}>
                        <FaSpinner className="fa-spin" /> Processing
                    </div>
                    <div className={styles.content}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>Please wait while we verify the membership status.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!valid || !member) {
        return (
            <div className={styles.container}>
                <div className={styles.verificationCard}>
                    <div className={styles.header}>
                        <img 
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png" 
                            alt="Blitz Tesla Club" 
                            className={styles.logo} 
                        />
                        <h1>Verification Failed</h1>
                    </div>
                    <div className={`${styles.statusBanner} ${styles.invalid}`}>
                        <FaTimesCircle /> Invalid / Inactive
                    </div>
                    <div className={styles.content}>
                        <div className={styles.memberPhoto}>
                            <FaUser className={styles.memberPhotoIcon} />
                        </div>
                        <div className={styles.infoGroup}>
                            <div style={{ color: 'var(--color-error)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {error || 'This membership is not valid.'}
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.scanBtn} onClick={() => window.location.reload()}>
                                <FaQrcode /> Scan Again
                            </button>
                        </div>
                    </div>
                    <div className={styles.footer}>
                        Blitz Tesla Club Member Verification System
                    </div>
                </div>
            </div>
        );
    }

    const memberSince = new Date(member.created_at).getFullYear();
    const isPremium = member.membership_type === 'premium';
    const isAdmin = member.membership_type === 'admin' || member.role === 'admin'; // Assuming role field exists or inferred
    
    const badgeClass = isAdmin ? styles.admin : (isPremium ? styles.premium : styles.standard);
    const badgeText = isAdmin ? 'Administrator' : (isPremium ? 'Premium Member' : 'Standard Member');

    return (
        <div className={styles.container}>
            <div className={styles.verificationCard}>
                <div className={styles.header}>
                    <img 
                        src="https://i.ibb.co/fkrdXZK/Logo4-white.png" 
                        alt="Blitz Tesla Club" 
                        className={styles.logo} 
                    />
                    <h1>Member Verified</h1>
                </div>
                
                <div className={`${styles.statusBanner} ${styles.valid}`}>
                    <FaCheckCircle /> Active Membership
                </div>

                <div className={styles.content}>
                    <div className={styles.memberPhoto}>
                        {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.full_name} />
                        ) : (
                            <FaUser className={styles.memberPhotoIcon} />
                        )}
                    </div>

                    <div className={styles.infoGroup}>
                        <span className={styles.label}>Member Name</span>
                        <span className={styles.value}>{member.full_name}</span>
                        <span className={`${styles.membershipBadge} ${badgeClass}`}>
                            {badgeText}
                        </span>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Member ID</span>
                            <span className={styles.value} style={{ fontFamily: 'monospace' }}>
                                {member.member_id || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Member Since</span>
                            <span className={styles.value}>{memberSince}</span>
                        </div>
                    </div>
                    
                    {member.car_models && member.car_models.length > 0 && (
                        <div className={styles.infoGroup} style={{ marginTop: '20px' }}>
                            <span className={styles.label}>Vehicle(s)</span>
                            <div style={{ fontWeight: '600' }}>{member.car_models.join(', ')}</div>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <a href="/admin/dashboard" className={styles.portalBtn}>
                            <FaStore /> Enter Vendor Portal
                        </a>
                    </div>
                </div>
                
                <div className={styles.footer}>
                    Blitz Tesla Club Member Verification System
                </div>
            </div>
        </div>
    );
}

export default function VerifyMemberPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        }>
            <VerifyMemberContent />
        </Suspense>
    );
}
