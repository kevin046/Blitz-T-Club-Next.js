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
    role?: string;
}

function VerifyMemberContent() {
    const searchParams = useSearchParams();
    const memberIdParam = searchParams.get('member_id');

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [member, setMember] = useState<MemberProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Vendor authentication state
    const [showVendorAuth, setShowVendorAuth] = useState(false);
    const [vendorPassword, setVendorPassword] = useState('');
    const [vendorAuthLoading, setVendorAuthLoading] = useState(false);
    const [vendorAuthError, setVendorAuthError] = useState<string | null>(null);

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
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setMember(data);

                    // Log the QR scan
                    try {
                        await supabase.from('qr_scan_logs').insert({
                            member_id: data.id,
                            scanned_at: new Date().toISOString(),
                            scan_type: 'member_verification',
                            user_agent: navigator.userAgent,
                            additional_data: {
                                member_name: data.full_name,
                                member_id_display: data.member_id
                            }
                        });
                    } catch (logError) {
                        console.error('Failed to log scan:', logError);
                        // Don't fail verification if logging fails
                    }

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

    const handleVendorAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setVendorAuthLoading(true);
        setVendorAuthError(null);

        try {
            // Fetch all vendors
            const { data: vendors, error: vendorError } = await supabase
                .from('vendors')
                .select('*');

            if (vendorError) throw vendorError;

            // Find matching vendor by password
            let matchedVendor: any = null;

            for (const vendor of vendors || []) {
                // Simple password comparison (in production, use proper hashing)
                if (vendor.password_hash === vendorPassword) {
                    matchedVendor = vendor;
                    break;
                }
            }

            if (!matchedVendor) {
                setVendorAuthError('Invalid vendor password. Please try again.');
                setVendorAuthLoading(false);
                return;
            }

            // Store vendor session
            sessionStorage.setItem('vendor_id', matchedVendor.id);
            sessionStorage.setItem('vendor_name', matchedVendor.name);
            sessionStorage.setItem('member_id', member?.id || '');

            // Redirect to vendor-specific tracking page
            window.location.href = `${matchedVendor.tracking_route}?member_id=${member?.id}`;
        } catch (err: any) {
            console.error('Vendor auth error:', err);
            setVendorAuthError(err.message || 'An error occurred during authentication.');
            setVendorAuthLoading(false);
        }
    };

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
    const isAdmin = member.membership_type === 'admin' || member.role === 'admin';

    const badgeClass = isAdmin ? styles.admin : (isPremium ? styles.premium : styles.standard);
    const badgeText = isAdmin ? 'Administrator' : (isPremium ? 'Premium Member' : 'Standard Member');

    // Show vendor authentication form if requested
    if (showVendorAuth) {
        return (
            <div className={styles.container}>
                <div className={styles.verificationCard}>
                    <div className={styles.header}>
                        <img
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                            alt="Blitz Tesla Club"
                            className={styles.logo}
                        />
                        <h1>Vendor Authentication</h1>
                        <p>Enter your vendor password to access tracking</p>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.memberPreview}>
                            <div className={styles.memberPhoto} style={{ marginBottom: '15px' }}>
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.full_name} />
                                ) : (
                                    <FaUser className={styles.memberPhotoIcon} />
                                )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '5px' }}>
                                    {member.full_name}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                    ID: {member.member_id}
                                </div>
                                <span className={`${styles.membershipBadge} ${badgeClass}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                                    {badgeText}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleVendorAuth} style={{ marginTop: '30px' }}>
                            <div className={styles.formGroup}>
                                <label htmlFor="vendorPassword" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                                    <FaStore /> Vendor Password
                                </label>
                                <input
                                    type="password"
                                    id="vendorPassword"
                                    value={vendorPassword}
                                    onChange={(e) => setVendorPassword(e.target.value)}
                                    placeholder="Enter your vendor password"
                                    required
                                    className={styles.input}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        border: '2px solid var(--border-color)',
                                        background: 'var(--secondary-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            {vendorAuthError && (
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    border: '1px solid rgba(255, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    color: 'var(--danger-red)',
                                    marginTop: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaTimesCircle />
                                    {vendorAuthError}
                                </div>
                            )}

                            <div className={styles.actions} style={{ marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className={styles.portalBtn}
                                    disabled={vendorAuthLoading}
                                    style={{ width: '100%' }}
                                >
                                    {vendorAuthLoading ? (
                                        <>
                                            <FaSpinner className="fa-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle />
                                            Access Tracking Dashboard
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={styles.scanBtn}
                                    onClick={() => setShowVendorAuth(false)}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    <FaTimesCircle />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.footer}>
                        Blitz Tesla Club Vendor Portal
                    </div>
                </div>
            </div>
        );
    }

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
                        <button
                            onClick={() => setShowVendorAuth(true)}
                            className={styles.portalBtn}
                        >
                            <FaStore /> Vendor: Log Deal
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
