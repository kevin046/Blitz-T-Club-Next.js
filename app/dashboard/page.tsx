'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaIdCard, FaCalendarAlt, FaShoppingBag, FaCog, FaSignOutAlt, FaCar, FaMapMarkerAlt, FaEdit, FaExclamationTriangle, FaUserShield, FaStore, FaUsers, FaTachometerAlt } from 'react-icons/fa';
import MembershipCard from '@/components/MembershipCard';
import DynamicJotformAI from '@/components/DynamicJotformAI';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const { user, profile, loading, signOut, isAdmin } = useAuth();

    // Redirect if not logged in
    if (!loading && !user) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (!profile) return null;

    const isProfileIncomplete = !profile.full_name || !profile.phone || !profile.full_address;

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardGrid}>
                {/* Welcome Section */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h2><FaUser /> Welcome, {profile.full_name?.split(' ')[0] || 'Member'}!</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.usernameDisplay}>
                            <span className={styles.usernameLabel}>Username:</span>
                            <span id="userUsername">@{profile.username}</span>
                        </p>
                        <div className={styles.statusIndicators}>
                            <div className={styles.statusItem}>
                                <span className={styles.statusText}>{profile.membership_type === 'premium' ? 'Premium Member' : 'Standard Member'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Membership Card Section */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h2><FaIdCard /> Digital Membership Card</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <MembershipCard profile={profile} />
                    </div>
                </div>

                {/* Admin Section - Only visible to admins */}
                {isAdmin && (
                    <div className={`${styles.dashboardCard} ${styles.adminSection}`}>
                        <div className={styles.cardHeader}>
                            <h2><FaUserShield /> Admin Controls</h2>
                        </div>
                        <div className={styles.adminGrid}>
                            <a href="/admin/dashboard" className={styles.adminCard}>
                                <div className={styles.adminIcon}><FaTachometerAlt /></div>
                                <h3>Admin Dashboard</h3>
                                <p>Manage users, events, and analytics</p>
                            </a>
                            <a href="/admin/shop" className={styles.adminCard}>
                                <div className={styles.adminIcon}><FaStore /></div>
                                <h3>Shop Manager</h3>
                                <p>Manage products, orders, and inventory</p>
                            </a>
                            <a href="/admin/dashboard" className={styles.adminCard}>
                                <div className={styles.adminIcon}><FaUsers /></div>
                                <h3>Member Database</h3>
                                <p>View and manage club memberships</p>
                            </a>
                        </div>
                    </div>
                )}

                {/* Profile Completion Alert */}
                {isProfileIncomplete && (
                    <div className={`${styles.dashboardCard} ${styles.completionAlert}`}>
                        <div className={styles.cardHeader}>
                            <h2><FaExclamationTriangle /> Complete Your Profile</h2>
                        </div>
                        <div className={styles.cardContent}>
                            <p>Please complete your profile to unlock all features.</p>
                            <button className={styles.btn}>Update Profile</button>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h2>Quick Actions</h2>
                    </div>
                    <div className={styles.quickLinksGrid}>
                        <a href="/events" className={styles.quickLinkItem}>
                            <FaCalendarAlt />
                            <span>Events</span>
                        </a>
                        <a href="/shop" className={styles.quickLinkItem}>
                            <FaShoppingBag />
                            <span>Shop</span>
                        </a>
                        <a href="/profile" className={styles.quickLinkItem}>
                            <FaCog />
                            <span>Settings</span>
                        </a>
                    </div>
                </div>

                {/* Vehicle Info */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h2><FaCar /> My Vehicles</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.carModelsList}>
                            {profile.car_models && profile.car_models.map((model: string, index: number) => (
                                <div key={index} className={styles.carModelBadge}>
                                    <FaCar /> {model}
                                </div>
                            ))}
                            {(!profile.car_models || profile.car_models.length === 0) && (
                                <p>No vehicles added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Info */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h2><FaMapMarkerAlt /> Address</h2>
                        <button className={styles.editInfoBtn}><FaEdit /> Edit</button>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.addressDisplay}>
                            {profile.full_address ? (
                                <p>{profile.full_address}</p>
                            ) : (
                                <>
                                    <p>{profile.street}</p>
                                    <p>{profile.city}, {profile.province} {profile.postal_code}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <DynamicJotformAI />
        </div>
    );
}
