import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import styles from './admin-dashboard.module.css';

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

interface EditUserModalProps {
    user: Profile | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: Partial<Profile>) => Promise<void>;
}

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                // Normalize DOB field for input
                date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : 
                               user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save user', error);
            alert('Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Edit User: {user.full_name}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.editForm}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Member ID</label>
                        <input
                            type="text"
                            name="member_id"
                            value={formData.member_id || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Address</label>
                        <input
                            type="text"
                            name="full_address"
                            value={formData.full_address || formData.address || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Car Models</label>
                        <input
                            type="text"
                            name="car_models"
                            value={formData.car_models || formData.car_model || formData.vehicle_model || ''}
                            onChange={handleChange}
                            placeholder="Model 3, Model Y..."
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select
                                name="membership_status"
                                value={formData.membership_status || 'active'}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="pending_verification">Pending Verification</option>
                                <option value="suspended">Suspended</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <select
                                name="role"
                                value={formData.role || 'user'}
                                onChange={handleChange}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>
                            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
