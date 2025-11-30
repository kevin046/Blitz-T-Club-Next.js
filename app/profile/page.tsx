'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCar, FaSave, FaArrowLeft, FaKey } from 'react-icons/fa';
import styles from './profile.module.css';

export default function ProfileSettings() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        street: profile?.street || '',
        city: profile?.city || '',
        province: profile?.province || '',
        postal_code: profile?.postal_code || '',
        vehicle_model: profile?.vehicle_model || '',
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!user) throw new Error('Not authenticated');

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    street: formData.street,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code,
                    vehicle_model: formData.vehicle_model,
                    full_address: `${formData.street}, ${formData.city}, ${formData.province} ${formData.postal_code}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if not logged in (use useEffect to avoid render-time navigation)
    // Redirect if not logged in (use useEffect to avoid render-time navigation)
    if (authLoading) return <div className={styles.settingsPage}><div className={styles.container}>Loading...</div></div>;

    if (!user) {
        return (
            <div className={styles.settingsPage}>
                <div className={styles.container}>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.settingsPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1><FaUser /> Profile Settings</h1>
                    <p>Update your personal information and preferences</p>
                </div>

                {success && (
                    <div className={styles.successMessage}>
                        ✓ Profile updated successfully! Redirecting...
                    </div>
                )}

                {error && (
                    <div className={styles.errorMessage}>
                        ✗ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.settingsForm}>
                    {/* Personal Information */}
                    <div className={styles.section}>
                        <h2><FaUser /> Personal Information</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="full_name">Full Name *</label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="(123) 456-7890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className={styles.section}>
                        <h2><FaMapMarkerAlt /> Address</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="street">Street Address *</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="city">City *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    placeholder="Toronto"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="province">Province *</label>
                                <select
                                    id="province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Province</option>
                                    <option value="ON">Ontario</option>
                                    <option value="QC">Quebec</option>
                                    <option value="BC">British Columbia</option>
                                    <option value="AB">Alberta</option>
                                    <option value="MB">Manitoba</option>
                                    <option value="SK">Saskatchewan</option>
                                    <option value="NS">Nova Scotia</option>
                                    <option value="NB">New Brunswick</option>
                                    <option value="PE">Prince Edward Island</option>
                                    <option value="NL">Newfoundland and Labrador</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="postal_code">Postal Code *</label>
                                <input
                                    type="text"
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    required
                                    placeholder="M5V 3A8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className={styles.section}>
                        <h2><FaCar /> Vehicle Information</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="vehicle_model">Tesla Model *</label>
                                <select
                                    id="vehicle_model"
                                    name="vehicle_model"
                                    value={formData.vehicle_model}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Model</option>
                                    <option value="Model S">Model S</option>
                                    <option value="Model 3">Model 3</option>
                                    <option value="Model X">Model X</option>
                                    <option value="Model Y">Model Y</option>
                                    <option value="Cybertruck">Cybertruck</option>
                                    <option value="Roadster">Roadster</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Account Security */}
                    <div className={styles.section}>
                        <h2><FaKey /> Account Security</h2>
                        <div className={styles.formGroup}>
                            <label><FaEnvelope /> Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={styles.disabled}
                            />
                            <small>Contact support to change your email address</small>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={styles.saveBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>Saving...</>
                        ) : (
                            <><FaSave /> Save Changes</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
