
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaCalendarAlt, FaHistory, FaCalendarPlus, FaMapMarkerAlt, FaInfoCircle, FaCalendarDay, FaImages, FaCheck, FaTimes, FaCar } from 'react-icons/fa';
import Link from 'next/link';
import styles from './events.module.css';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    image_url?: string;
    highlights?: string[];
    map_url?: string;
}

interface Registration {
    id: string;
    event_id: string;
    user_id: string;
    status: string;
}

export default function EventsPage() {

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data: regs } = await supabase
                        .from('event_registrations')
                        .select('*')
                        .eq('user_id', user.id)
                        .is('cancelled_at', null);
                    setRegistrations(regs || []);
                }

                await fetchEvents();
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []); // Empty dependency array - only run once on mount

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        }
    };

    const handleRegister = async (event: Event) => {
        if (!user) {
            window.location.href = '/login?redirect=/events';
            return;
        }

        if (!confirm(`Are you sure you want to register for ${event.title}?`)) return;

        setRegistering(true);
        try {
            // Check if already registered
            const isRegistered = registrations.some(r => r.event_id === event.id);
            if (isRegistered) {
                alert('You are already registered for this event.');
                setRegistering(false);
                return;
            }

            // Get user profile for vehicle info
            const { data: profile } = await supabase
                .from('profiles')
                .select('vehicle_model')
                .eq('id', user.id)
                .single();

            const { error } = await supabase
                .from('event_registrations')
                .insert([{
                    user_id: user.id,
                    event_id: event.id,
                    vehicle_model: profile?.vehicle_model || 'Unknown',
                    registered_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert('Successfully registered!');
            // Refresh registrations
            const { data: regs } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('user_id', user.id)
                .is('cancelled_at', null);
            setRegistrations(regs || []);
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register: ' + error.message);
        } finally {
            setRegistering(false);
        }
    };

    const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
    const pastEvents = events.filter(e => new Date(e.date) <= new Date());

    const openModal = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
    };

    if (loading) return <div className={styles.loading}>Loading Events...</div>;

    return (
        <div className={styles.eventsPage}>
            <header className={styles.header}>
                <h1>Events</h1>
                <p>Join us for exclusive Tesla owner gatherings and experiences</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    <FaCalendarAlt /> Upcoming Events
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'past' ? styles.active : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    <FaHistory /> Past Events
                </button>
            </div>

            <div className={styles.eventsGrid}>
                {activeTab === 'upcoming' ? (
                    upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => {
                            const isRegistered = registrations.some(r => r.event_id === event.id);
                            return (
                                <div key={event.id} className={styles.eventCard}>
                                    <div className={styles.eventImage}>
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} />
                                        ) : (
                                            <div className={styles.placeholderImage}><FaCalendarDay /></div>
                                        )}
                                    </div>
                                    <div className={styles.eventContent}>
                                        <h3>{event.title}</h3>
                                        <div className={styles.eventMeta}>
                                            <span><FaCalendarDay /> {new Date(event.date).toLocaleString()}</span>
                                            <span><FaMapMarkerAlt /> {event.location}</span>
                                        </div>
                                        <p className={styles.description}>{event.description.substring(0, 100)}...</p>
                                        <div className={styles.actions}>
                                            <button className={styles.detailsBtn} onClick={() => openModal(event)}>
                                                <FaInfoCircle /> Details
                                            </button>
                                            {isRegistered ? (
                                                <button className={styles.registeredBtn} disabled>
                                                    <FaCheck /> Registered
                                                </button>
                                            ) : (
                                                <button
                                                    className={styles.registerBtn}
                                                    onClick={() => handleRegister(event)}
                                                    disabled={registering}
                                                >
                                                    {registering ? 'Registering...' : 'Register Now'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}><FaCalendarPlus /></div>
                            <h3>More Events Coming Soon</h3>
                            <p>We're constantly planning new experiences for our members</p>
                            <Link href="/contact" className={styles.suggestBtn}>Suggest an Event Idea</Link>
                        </div>
                    )
                ) : (
                    pastEvents.length > 0 ? (
                        pastEvents.map(event => (
                            <div key={event.id} className={`${styles.eventCard} ${styles.pastEvent}`}>
                                <div className={styles.eventImage}>
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title} />
                                    ) : (
                                        <div className={styles.placeholderImage}><FaHistory /></div>
                                    )}
                                    <div className={styles.pastBadge}>Past Event</div>
                                </div>
                                <div className={styles.eventContent}>
                                    <h3>{event.title}</h3>
                                    <div className={styles.eventMeta}>
                                        <span><FaCalendarDay /> {new Date(event.date).toLocaleDateString()}</span>
                                        <span><FaMapMarkerAlt /> {event.location}</span>
                                    </div>
                                    <div className={styles.actions}>
                                        <button className={styles.detailsBtn} onClick={() => openModal(event)}>
                                            <FaInfoCircle /> Details
                                        </button>
                                        <Link href="/gallery" className={styles.galleryBtn}>
                                            <FaImages /> View Gallery
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.placeholder}>
                            <p>No past events found.</p>
                        </div>
                    )
                )}
            </div>

            {isModalOpen && selectedEvent && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={closeModal}><FaTimes /></button>
                        <h2>{selectedEvent.title}</h2>
                        <div className={styles.modalGrid}>
                            <div className={styles.modalInfo}>
                                <div className={styles.detailItem}>
                                    <FaCalendarDay /> <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString()}
                                </div>
                                <div className={styles.detailItem}>
                                    <FaMapMarkerAlt /> <strong>Location:</strong> {selectedEvent.location}
                                </div>
                                <div className={styles.detailItem}>
                                    <FaInfoCircle /> <strong>Description:</strong>
                                    <p>{selectedEvent.description}</p>
                                </div>
                                {selectedEvent.highlights && (
                                    <div className={styles.detailItem}>
                                        <FaCheck /> <strong>Highlights:</strong>
                                        <ul>
                                            {selectedEvent.highlights.map((h, i) => <li key={i}>{h}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {selectedEvent.map_url && (
                                <div className={styles.modalMap}>
                                    <iframe
                                        src={selectedEvent.map_url}
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            {activeTab === 'upcoming' && !registrations.some(r => r.event_id === selectedEvent.id) && (
                                <button
                                    className={styles.registerBtn}
                                    onClick={() => {
                                        handleRegister(selectedEvent);
                                        closeModal();
                                    }}
                                >
                                    Register Now
                                </button>
                            )}
                            <button className={styles.secondaryBtn} onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
