'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaCar, FaHome, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUserPlus } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './register.module.css';

export default function Register() {
    const router = useRouter();
    const { theme } = useTheme();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        carModels: [] as string[],
        street: '',
        city: '',
        province: '',
        postalCode: '',
        password: '',
        confirmPassword: '',
        licensePlate: '',
        terms: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'carModels') {
            const updatedModels = checked
                ? [...formData.carModels, value]
                : formData.carModels.filter((model) => model !== value);
            setFormData({ ...formData, carModels: updatedModels });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'phoneNumber') {
            // Phone formatting
            let numbers = value.replace(/\D/g, '');
            let formatted = '';
            if (numbers.length > 0) formatted += '(' + numbers.substring(0, 3);
            if (numbers.length >= 4) formatted += ')-' + numbers.substring(3, 6);
            if (numbers.length >= 7) formatted += '-' + numbers.substring(6, 10);
            setFormData({ ...formData, [name]: formatted });
        } else if (name === 'postalCode') {
            setFormData({ ...formData, [name]: value.toUpperCase() });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) return 'Full Name is required.';
        if (!/^[a-zA-Z\',.\s-]+$/.test(formData.fullName)) return 'Full Name contains invalid characters.';
        if (!formData.email.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address.';
        if (!/^\(\d{3}\)-\d{3}-\d{4}$/.test(formData.phoneNumber)) return 'Invalid phone number format.';

        const dob = new Date(formData.dateOfBirth);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
        if (age < 16) return 'You must be at least 16 years old to register.';

        if (formData.carModels.length === 0) return 'Please select at least one Tesla model.';
        if (!formData.street.trim()) return 'Street address is required.';
        if (!formData.city.trim()) return 'City is required.';
        if (!formData.province.trim()) return 'Province is required.';
        if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(formData.postalCode)) return 'Invalid Canadian postal code.';

        if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(formData.password)) return 'Password must be 8+ chars with letters and numbers.';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
        if (!formData.terms) return 'You must agree to the Terms of Service.';

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    username: formData.email.split('@')[0], // Simple username generation
                    phoneNumber: formData.phoneNumber,
                    dateOfBirth: formData.dateOfBirth,
                    carModels: formData.carModels,
                    licensePlate: formData.licensePlate,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        province: formData.province,
                        postalCode: formData.postalCode,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success! Redirect to success page
            router.push('/registration-success');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.registerContainer}>
                <div className={styles.registerBox}>
                    <div className={styles.registerHeader}>
                        <img
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                            alt="Blitz Tesla Club Logo"
                            className={styles.registerLogo}
                            style={{ filter: theme === 'light' ? 'invert(1)' : 'none' }}
                            suppressHydrationWarning
                        />
                        <h2>Join Blitz T Club</h2>
                        <p>Create your account to become a member</p>
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <form className={styles.registerForm} onSubmit={handleSubmit}>
                        {/* Personal Info */}
                        <div className={styles.sectionTitle}>Personal Information</div>

                        <div className={styles.formGroup}>
                            <label htmlFor="fullName"><FaUser /> Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email"><FaEnvelope /> Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label htmlFor="phoneNumber"><FaPhone /> Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="(123)-456-7890"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="dateOfBirth"><FaBirthdayCake /> Date of Birth</label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className={styles.sectionTitle}>Vehicle Information</div>
                        <div className={styles.formGroup}>
                            <label><FaCar /> Tesla Models You Own</label>
                            <div className={styles.checkboxGroup}>
                                {['Model 3', 'Model 3 Highland', 'Model Y', 'Model Y Juniper', 'Model S', 'Model X', 'Cybertruck', 'Roadster'].map((model) => (
                                    <div key={model} className={styles.checkboxOption}>
                                        <input
                                            type="checkbox"
                                            id={model.replace(/\s/g, '')}
                                            name="carModels"
                                            value={model}
                                            checked={formData.carModels.includes(model)}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor={model.replace(/\s/g, '')}>{model}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="licensePlate"><FaCar /> License Plate Number (Optional)</label>
                            <input
                                type="text"
                                id="licensePlate"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleInputChange}
                                placeholder="Enter your vehicle license plate"
                                style={{ textTransform: 'uppercase' }}
                            />
                            <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                                Helps us identify your car during events like lightshows.
                            </small>
                        </div>

                        {/* Address Info */}
                        <div className={styles.sectionTitle}>Address</div>
                        <div className={styles.formGroup}>
                            <label><FaHome /> Home Address</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                required
                                placeholder="Street Address"
                                className={styles.mb2}
                            />
                            <div className={styles.row}>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="City"
                                />
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Province"
                                />
                            </div>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                required
                                placeholder="Postal Code"
                                className={styles.mt2}
                            />
                        </div>

                        {/* Security */}
                        <div className={styles.sectionTitle}>Security</div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label htmlFor="password"><FaLock /> Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword"><FaLock /> Confirm Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Confirm Password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.termsCheckbox}>
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleInputChange}
                                required
                            />
                            <label htmlFor="terms">
                                I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
                            </label>
                        </div>

                        <button type="submit" className={styles.registerBtn} disabled={loading}>
                            {loading ? (
                                <>
                                    <FaSpinner className="fa-spin" /> Creating Account...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus /> Create Account
                                </>
                            )}
                        </button>

                        <div className={styles.formFooter}>
                            <p>Already have an account? <Link href="/login">Sign in</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
