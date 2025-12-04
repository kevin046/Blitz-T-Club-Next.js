'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { FaEye, FaEyeSlash, FaSpinner, FaCheck } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.css';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const { user, loading: authLoading } = useAuth();

    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    useEffect(() => {
        if (user && !authLoading) {
            router.replace(redirectUrl); // Use replace to prevent back-button loops
        }
    }, [user, authLoading, router, redirectUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setSuccess(true);
            // Navigation is handled by the useEffect above once auth state updates
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message.includes('Email not confirmed')) {
                setError('Please verify your email before logging in.');
            } else {
                setError(err.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <div className={styles.loginHeader}>
                        <img
                            src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                            alt="Blitz Tesla Club Logo"
                            className={styles.loginLogo}
                            style={{ filter: theme === 'light' ? 'invert(1)' : 'none' }}
                            suppressHydrationWarning
                        />
                        <h2>Member Login</h2>
                    </div>

                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        {searchParams.get('registered') === 'true' && (
                            <div className={styles.formSuccess}>
                                ✅ Registration successful! Please check your email to verify your account before logging in.
                            </div>
                        )}
                        {error && <div className={styles.formError}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                autoComplete="username"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className={`${styles.formGroup} ${styles.rememberMe}`}>
                            <input type="checkbox" id="remember" name="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>

                        <button type="submit" className={styles.loginBtn} disabled={loading || success}>
                            {loading ? (
                                <>
                                    <FaSpinner className="fa-spin" /> Logging in...
                                </>
                            ) : success ? (
                                <>
                                    <FaCheck /> Success! Redirecting...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className={styles.formFooter}>
                            <Link href="/reset-password">Forgot Password?</Link>
                            <Link href="/register">Not a member? Join now</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
