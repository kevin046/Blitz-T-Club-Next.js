
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaTachometerAlt, FaUsersCog, FaCalendarAlt, FaFileAlt, FaCogs, FaUsers, FaCalendarCheck, FaUserPlus, FaUserCheck, FaUserClock, FaUserSlash, FaFileExport, FaQrcode, FaCalendarDay, FaCar, FaIdCard, FaEnvelope, FaSearch, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import styles from './admin-dashboard.module.css';

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

export default function AdminDashboard() {
    const router = useRouter();

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

    useEffect(() => {
        const initAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                router.push('/dashboard');
                return;
            }

            await loadDashboardData();
            setLoading(false);
        };

        initAdmin();
    }, [supabase, router]);

    const loadDashboardData = async () => {
        await Promise.all([
            fetchStats(),
            fetchRecentActivity(),
            fetchUsers(),
            fetchEvents(),
            fetchRegistrations()
        ]);
    };

    const fetchStats = async () => {
        // 1. Total Users (Highest Member ID)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('member_id')
            .not('member_id', 'is', null);

        let highestMemberNumber = 0;
        profiles?.forEach(p => {
            if (p.member_id?.startsWith('BTC')) {
                const num = parseInt(p.member_id.replace('BTC', ''), 10);
                if (!isNaN(num) && num > highestMemberNumber) highestMemberNumber = num;
            }
        });

        // 2. Status Breakdown
        const { data: statusCounts } = await supabase
            .from('profiles')
            .select('membership_status');

        let active = 0, pending = 0, suspended = 0;
        statusCounts?.forEach(p => {
            if (p.membership_status === 'active') active++;
            else if (['pending', 'pending_verification'].includes(p.membership_status)) pending++;
            else if (p.membership_status === 'suspended') suspended++;
        });

        // 3. Events
        const { data: eventsData } = await supabase.from('events').select('date');
        const upcoming = eventsData?.filter(e => new Date(e.date) > new Date()).length || 0;

        // 4. Recent Registrations
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: recentRegs } = await supabase
            .from('event_registrations')
            .select('id', { count: 'exact' })
            .gt('registered_at', thirtyDaysAgo.toISOString())
            .is('cancelled_at', null);

        setStats({
            totalUsers: highestMemberNumber,
            activeEvents: upcoming,
            totalEvents: eventsData?.length || 0,
            recentRegistrations: recentRegs || 0,
            activeUsers: active,
            pendingUsers: pending,
            suspendedUsers: suspended,
        });
    };

    const fetchRecentActivity = async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: members } = await supabase
            .from('profiles')
            .select('*')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(5);
        setRecentMembers(members || []);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { data: regs } = await supabase
            .from('event_registrations')
            .select('*, profiles(full_name, member_id), events(title)')
            .gte('registered_at', threeDaysAgo.toISOString())
            .is('cancelled_at', null)
            .order('registered_at', { ascending: false })
            .limit(5);
        setRecentRegistrations(regs || []);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        setUsers(data || []);
    };

    const fetchEvents = async () => {
        const { data } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });
        setEvents(data || []);
    };

    const fetchRegistrations = async () => {
        const { data } = await supabase
            .from('event_registrations')
            .select('*, profiles(full_name, email, member_id, phone), events(title)')
            .order('registered_at', { ascending: false });
        setRegistrations(data || []);
    };

    // Filtering Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.member_id?.toLowerCase().includes(userSearch.toLowerCase());
        const matchesStatus = userStatusFilter === 'all' || user.membership_status === userStatusFilter;
        return matchesSearch && matchesStatus;
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
                <div className={styles.sidebarHeader}>
                    <h3>Admin Menu</h3>
                </div>
                <nav className={styles.sidebarNav}>
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
                    <button
                        className={`${styles.navItem} ${activeSection === 'content' ? styles.active : ''}`}
                        onClick={() => setActiveSection('content')}
                    >
                        <FaFileAlt /> Content Management
                    </button>
                </nav>
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
                                        <th>Member ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.member_id || '-'}</td>
                                            <td>{user.full_name}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`${styles.statusBadge} ${styles[user.membership_status]}`}>{user.membership_status}</span></td>
                                            <td>{user.role}</td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button className={styles.actionBtn}><FaEdit /></button>
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
                                                <button className={styles.actionBtn}><FaEdit /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
