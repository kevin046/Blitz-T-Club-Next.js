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
        full_name: '',
        phone: '',
        date_of_birth: '',
        street: '',
        city: '',
        province: '',
        postal_code: '',
        license_plate: '',
    });

    // Vehicle state - now using vehicles table
    interface Vehicle {
        id?: string;
        model: string;
        license_plate: string;
    }
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [newVehicle, setNewVehicle] = useState<Vehicle>({ model: '', license_plate: '' });

    // Fetch vehicles from vehicles table
    const fetchVehicles = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching vehicles:', error);
        } else if (data) {
            setVehicles(data);
        }
    };

    // Populate form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                date_of_birth: profile.date_of_birth || '',
                street: profile.street || '',
                city: profile.city || '',
                province: profile.province || '',
                postal_code: profile.postal_code || '',
                license_plate: profile.license_plate || '',
            });
        }
    }, [profile]);

    // Fetch vehicles when user is available
    useEffect(() => {
        if (user) {
            fetchVehicles();
        }
    }, [user]);

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

    const handleAddVehicle = async () => {
        if (!newVehicle.model) {
            setError('Please select a vehicle model');
            return;
        }

        if (!user) return;

        try {
            const { error: insertError } = await supabase
                .from('vehicles')
                .insert([{
                    user_id: user.id,
                    model: newVehicle.model,
                    license_plate: newVehicle.license_plate.toUpperCase()
                }]);

            if (insertError) throw insertError;

            // Refresh vehicles list
            await fetchVehicles();
            setNewVehicle({ model: '', license_plate: '' });
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to add vehicle');
        }
    };

    const handleUpdateVehiclePlate = async (vehicleId: string, newPlate: string) => {
        try {
            const { error: updateError } = await supabase
                .from('vehicles')
                .update({ license_plate: newPlate.toUpperCase(), updated_at: new Date().toISOString() })
                .eq('id', vehicleId);

            if (updateError) throw updateError;

            // Update local state
            setVehicles(vehicles.map(v =>
                v.id === vehicleId ? { ...v, license_plate: newPlate.toUpperCase() } : v
            ));
        } catch (err: any) {
            setError(err.message || 'Failed to update license plate');
        }
    };

    const handleRemoveVehicle = async (vehicleId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', vehicleId);

            if (deleteError) throw deleteError;

            // Update local state
            setVehicles(vehicles.filter(v => v.id !== vehicleId));
        } catch (err: any) {
            setError(err.message || 'Failed to remove vehicle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!user) throw new Error('Not authenticated');

            // Get vehicle models for backward compatibility with car_models field
            const vehicleModels = vehicles.map(v => v.model);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    date_of_birth: formData.date_of_birth,
                    street: formData.street,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code,
                    car_models: vehicleModels,
                    vehicle_model: vehicleModels[0] || '', // Keep first model for backward compatibility
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

                            <div className={styles.formGroup}>
                                <label htmlFor="date_of_birth">Date of Birth</label>
                                <input
                                    type="date"
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
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

                        {/* Current Vehicles with License Plates */}
                        {vehicles.length > 0 && (
                            <div className={styles.currentVehicles}>
                                <h3>Your Tesla Vehicles:</h3>
                                <div className={styles.vehiclesList}>
                                    {vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className={styles.vehicleItem}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <FaCar />
                                                    <strong>{vehicle.model}</strong>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        License Plate:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={vehicle.license_plate || ''}
                                                        onChange={(e) => handleUpdateVehiclePlate(vehicle.id!, e.target.value)}
                                                        placeholder="ABC 123"
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            border: '1px solid var(--border-color)',
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.9rem',
                                                            maxWidth: '120px'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVehicle(vehicle.id!)}
                                                className={styles.removeBtn}
                                                title="Remove vehicle"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add New Vehicle */}
                        <div className={styles.formGrid} style={{ marginTop: '20px' }}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label>Add a New Vehicle</label>
                                <div className={styles.addVehicleContainer}>
                                    <select
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        className={styles.vehicleSelect}
                                    >
                                        <option value="">Select Tesla Model</option>
                                        <option value="Model S">Model S</option>
                                        <option value="Model 3">Model 3</option>
                                        <option value="Model 3 Highland">Model 3 Highland</option>
                                        <option value="Model X">Model X</option>
                                        <option value="Model Y">Model Y</option>
                                        <option value="Model Y Juniper">Model Y Juniper</option>
                                        <option value="Cybertruck">Cybertruck</option>
                                        <option value="Roadster">Roadster</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newVehicle.license_plate}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
                                        placeholder="License Plate (Optional)"
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            textTransform: 'uppercase',
                                            flex: '0 0 180px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddVehicle}
                                        className={styles.addBtn}
                                        disabled={!newVehicle.model}
                                    >
                                        Add Vehicle
                                    </button>
                                </div>
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
