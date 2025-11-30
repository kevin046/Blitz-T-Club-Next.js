
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaTachometerAlt, FaUsersCog, FaCalendarAlt, FaFileAlt, FaCogs, FaUsers, FaCalendarCheck, FaUserPlus, FaUserCheck, FaUserClock, FaUserSlash, FaFileExport, FaQrcode, FaCalendarDay, FaCar, FaIdCard, FaEnvelope, FaSearch, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaBoxOpen, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import styles from './admin-dashboard.module.css';
import EditUserModal from './EditUserModal';

// Types
interface Profile {
    id: string;
    full_name: string;
    email: string;
    member_id: string;
    membership_status: string;
    role: string;
    created_at: string;
    phone?: string;
    date_of_birth?: string;
    dob?: string;
    full_address?: string;
    address?: string;
    car_model?: string;
    car_models?: string;
    vehicle_model?: string;
}

interface Event {
    id: string;
    title: string;
    date: string;
}

interface Registration {
    id: string;
    user_id: string;
    event_id: string;
    vehicle_model: string;
    registered_at: string;
    cancelled_at?: string;
    waiver_signed?: boolean;
}

import { useAuth } from '@/contexts/AuthContext';

// ... imports ...

export default function AdminDashboard() {
    const router = useRouter();
    const { user, profile, loading: authLoading, profileLoading, isAdmin } = useAuth();

    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeEvents: 0,
        totalEvents: 0,
        recentRegistrations: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0,
    });
    const [recentMembers, setRecentMembers] = useState<Profile[]>([]);
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [eventSearch, setEventSearch] = useState('');
    const [eventFilter, setEventFilter] = useState('all');
    const [registrationStatusFilter, setRegistrationStatusFilter] = useState('active');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (authLoading || profileLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (!isAdmin) {
            router.push('/dashboard');
            return;
        }

        loadDashboardData().then(() => setLoading(false));
    }, [user, isAdmin, authLoading, profileLoading, router]);

    // Remove initAdmin and its call


    const fetchWithAuth = async (url: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    };

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                fetchDashboardStats(),
                fetchUsers(),
                fetchEvents(),
                fetchRegistrations()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/dashboard-stats');
            setStats(data.stats);
            setRecentMembers(data.recentMembers);
            setRecentRegistrations(data.recentRegistrations);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/users');
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchEvents = async () => {
        const { data } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });
        setEvents(data || []);
    };

    const fetchRegistrations = async () => {
        try {
            const data = await fetchWithAuth('/api/admin/registrations');
            setRegistrations(data || []);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    const formatDateEst = (dateString: string | undefined) => {
        if (!dateString) return '-';
        // If it's a full ISO string with time, use EST timezone
        if (dateString.includes('T')) {
            return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
        }
        // If it's just a date (YYYY-MM-DD), treat as UTC to prevent day shifting
        return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC' });
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEditClick = (user: Profile) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (updatedData: Partial<Profile>) => {
        if (!editingUser) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            const updatedUser = await response.json();

            // Update local state
            setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));

            // Close modal (handled by parent but good to ensure)
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
            throw error; // Re-throw for modal to handle
        }
    };

    // Filtering Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.member_id?.toLowerCase().includes(userSearch.toLowerCase());
        const matchesStatus = userStatusFilter === 'all' || user.membership_status === userStatusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;

        // Handle car_models fallback for sorting
        let aValue: any = a[sortConfig.key as keyof Profile];
        let bValue: any = b[sortConfig.key as keyof Profile];

        if (sortConfig.key === 'car_models') {
            aValue = a.car_models || a.car_model || a.vehicle_model || '';
            bValue = b.car_models || b.car_model || b.vehicle_model || '';
        }

        // Handle nulls
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.events?.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
            reg.profiles?.full_name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
            reg.profiles?.email?.toLowerCase().includes(eventSearch.toLowerCase()) ||
            reg.profiles?.member_id?.toLowerCase().includes(eventSearch.toLowerCase());
        const matchesEvent = eventFilter === 'all' || reg.event_id === eventFilter;
        const matchesStatus =
            registrationStatusFilter === 'all' ? true :
                registrationStatusFilter === 'active' ? !reg.cancelled_at :
                    !!reg.cancelled_at;
        return matchesSearch && matchesEvent && matchesStatus;
    });

    if (loading) return <div className={styles.loading}>Loading Admin Dashboard...</div>;

    return (
        <div className={styles.adminDashboard}>
            <aside className={styles.sidebar}>
                <button
                    className={`${styles.navItem} ${activeSection === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveSection('overview')}
                >
                    <FaTachometerAlt /> Overview
                </button>
                <button
                    className={`${styles.navItem} ${activeSection === 'users' ? styles.active : ''}`}
                    onClick={() => setActiveSection('users')}
                >
                    <FaUsersCog /> User Management
                </button>
                <button
                    className={`${styles.navItem} ${activeSection === 'events' ? styles.active : ''}`}
                    onClick={() => setActiveSection('events')}
                >
                    <FaCalendarAlt /> Event Management
                </button>
                <button className={styles.navItem} onClick={() => router.push('/admin/shop')}>
                    <FaBoxOpen /> Shop Management
                </button>
                <button
                    className={`${styles.navItem} ${activeSection === 'content' ? styles.active : ''}`}
                    onClick={() => setActiveSection('content')}
                >
                    <FaFileAlt /> Content Management
                </button>
            </aside>

            <main className={styles.content}>
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <h2>Dashboard Overview</h2>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <h4>Total Users</h4>
                                <p>{stats.totalUsers}</p>
                                <FaUsers />
                            </div>
                            <div className={styles.statCard}>
                                <h4>Active Events</h4>
                                <p>{stats.activeEvents}</p>
                                <FaCalendarCheck />
                            </div>
                            <div className={styles.statCard}>
                                <h4>Total Events</h4>
                                <p>{stats.totalEvents}</p>
                                <FaCalendarAlt />
                            </div>
                            <div className={styles.statCard}>
                                <h4>Recent Registrations (30d)</h4>
                                <p>{stats.recentRegistrations}</p>
                                <FaUserPlus />
                            </div>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <h4>Active Users</h4>
                                <p>{stats.activeUsers}</p>
                                <FaUserCheck />
                            </div>
                            <div className={styles.statCard}>
                                <h4>Pending Users</h4>
                                <p>{stats.pendingUsers}</p>
                                <FaUserClock />
                            </div>
                            <div className={styles.statCard}>
                                <h4>Suspended Users</h4>
                                <p>{stats.suspendedUsers}</p>
                                <FaUserSlash />
                            </div>
                        </div>

                        <div className={styles.recentActivity}>
                            <h3><FaTachometerAlt /> Recent Activity</h3>
                            <div className={styles.activityContainer}>
                                <div className={styles.activityColumn}>
                                    <h4><FaUserPlus /> New Members (Last 7 days)</h4>
                                    <div className={styles.activityList}>
                                        {recentMembers.length > 0 ? recentMembers.map(member => (
                                            <div key={member.id} className={styles.activityItem}>
                                                <div className={styles.activityHeader}>
                                                    <span className={styles.activityName}>{member.full_name}</span>
                                                    <span className={styles.activityDate}>{new Date(member.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className={styles.activityDetails}>
                                                    <span className={styles.activityEmail}><FaEnvelope /> {member.email}</span>
                                                    <span className={styles.activityId}><FaIdCard /> {member.member_id || 'N/A'}</span>
                                                </div>
                                            </div>
                                        )) : <p>No new members.</p>}
                                    </div>
                                </div>
                                <div className={styles.activityColumn}>
                                    <h4><FaCalendarCheck /> Recent Registrations</h4>
                                    <div className={styles.activityList}>
                                        {recentRegistrations.length > 0 ? recentRegistrations.map(reg => (
                                            <div key={reg.id} className={styles.activityItem}>
                                                <div className={styles.activityHeader}>
                                                    <span className={styles.activityName}>{reg.profiles?.full_name}</span>
                                                    <span className={styles.activityDate}>{new Date(reg.registered_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className={styles.activityDetails}>
                                                    <span className={styles.activityEvent}><FaCalendarDay /> {reg.events?.title}</span>
                                                    <span className={styles.activityModel}><FaCar /> {reg.vehicle_model}</span>
                                                </div>
                                            </div>
                                        )) : <p>No recent registrations.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'users' && (
                    <div className={styles.section}>
                        <h2>User Management</h2>
                        <div className={styles.tableControls}>
                            <div className={styles.searchBox}>
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="pending_verification">Pending Verification</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <button className={styles.primaryBtn}><FaPlus /> Add User</button>
                        </div>
                        <div className={styles.tableResponsive}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        {[
                                            { key: 'member_id', label: 'Member ID' },
                                            { key: 'full_name', label: 'Full Name' },
                                            { key: 'email', label: 'Email' },
                                            { key: 'date_of_birth', label: 'DOB' },
                                            { key: 'full_address', label: 'Address' },
                                            { key: 'car_models', label: 'Car Model' },
                                            { key: 'membership_status', label: 'Status' },
                                            { key: 'role', label: 'Role' },
                                            { key: 'created_at', label: 'Joined' },
                                        ].map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className={styles.sortableHeader}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {col.label}
                                                    {sortConfig.key === col.key ?
                                                        (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)
                                                        : <FaSort style={{ opacity: 0.3 }} />}
                                                </div>
                                            </th>
                                        ))}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.member_id || '-'}</td>
                                            <td>{user.full_name}</td>
                                            <td>{user.email || '-'}</td>
                                            <td>{user.date_of_birth ? formatDateEst(user.date_of_birth) : user.dob ? formatDateEst(user.dob) : '-'}</td>
                                            <td>{user.full_address || user.address || '-'}</td>
                                            <td>{user.car_models || user.car_model || user.vehicle_model || '-'}</td>
                                            <td><span className={`${styles.statusBadge} ${styles[user.membership_status]}`}>{user.membership_status}</span></td>
                                            <td>{user.role}</td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button className={styles.actionBtn} onClick={() => handleEditClick(user)}><FaEdit /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === 'events' && (
                    <div className={styles.section}>
                        <h2>Event Management & Registrations</h2>
                        <div className={styles.tableControls}>
                            <div className={styles.searchBox}>
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search registrations..."
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                />
                            </div>
                            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
                                <option value="all">All Events</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.title}</option>
                                ))}
                            </select>
                            <select value={registrationStatusFilter} onChange={(e) => setRegistrationStatusFilter(e.target.value)}>
                                <option value="active">Active</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <div className={styles.tableResponsive}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>User</th>
                                        <th>Member ID</th>
                                        <th>Vehicle</th>
                                        <th>Registered At</th>
                                        <th>Status</th>
                                        <th>Waiver</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistrations.map(reg => (
                                        <tr key={reg.id}>
                                            <td>{reg.events?.title}</td>
                                            <td>{reg.profiles?.full_name}</td>
                                            <td>{reg.profiles?.member_id || '-'}</td>
                                            <td>{reg.vehicle_model}</td>
                                            <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${reg.cancelled_at ? styles.cancelled : styles.active}`}>
                                                    {reg.cancelled_at ? 'Cancelled' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                {reg.waiver_signed ? <span className={styles.signed}><FaCheck /> Signed</span> : <span className={styles.notSigned}><FaTimes /> Not Signed</span>}
                                            </td>
                                            <td>
                                                {/* Placeholder for future event registration editing */}
                                                <button className={styles.actionBtn} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Editing registrations is not yet supported"><FaEdit /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            <EditUserModal
                user={editingUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveUser}
            />
        </div>
    );
}
