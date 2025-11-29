'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaCalendar, FaImages, FaGift, FaEnvelope, FaInfoCircle, FaUserPlus, FaSignInAlt, FaTachometerAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        document.body.classList.toggle('nav-open', !isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.classList.remove('nav-open');
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
        closeMenu();
    };

    const navItems = user
        ? [
            { href: '/', icon: FaHome, label: '', iconOnly: true },
            { href: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
            { href: '/events', icon: FaCalendar, label: 'Events' },
            { href: '/gallery', icon: FaImages, label: 'Gallery' },
            { href: '/member-benefits', icon: FaGift, label: 'Member Benefits' },
            { href: '/contact', icon: FaEnvelope, label: 'Contact' },
            { href: '/about', icon: FaInfoCircle, label: 'About Us' },
        ]
        : [
            { href: '/', icon: FaHome, label: '', iconOnly: true },
            { href: '/events', icon: FaCalendar, label: 'Events' },
            { href: '/gallery', icon: FaImages, label: 'Gallery' },
            { href: '/member-benefits', icon: FaGift, label: 'Member Benefits' },
            { href: '/contact', icon: FaEnvelope, label: 'Contact' },
            { href: '/about', icon: FaInfoCircle, label: 'About Us' },
            { href: '/register', icon: FaUserPlus, label: 'Join Us' },
            { href: '/login', icon: FaSignInAlt, label: 'Login' },
        ];

    if (pathname === '/blitz-shop') return null;

    return (
        <nav>
            <div className="logo">
                <Link href="/" onClick={closeMenu}>
                    <img
                        src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                        alt="Blitz Tesla Club Logo"
                        width="50"
                        height="50"
                        style={{ filter: theme === 'light' ? 'invert(1)' : 'none' }}
                        suppressHydrationWarning
                    />
                    <span>BLITZ T CLUB</span>
                </Link>
            </div>
            <button
                className={`menu-toggle ${isOpen ? 'nav-open' : ''}`}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                onClick={toggleMenu}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>
            <ul className={`nav-links ${isOpen ? 'active' : ''}`} id="nav-links">
                {isOpen && (
                    <div className="nav-brand">
                        <img src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png" alt="Blitz Tesla Club Logo" />
                    </div>
                )}
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`${pathname === item.href ? 'active' : ''} ${item.iconOnly ? 'icon-only' : ''}`}
                            onClick={closeMenu}
                            aria-label={item.iconOnly ? 'Home' : undefined}
                        >
                            <item.icon />
                            {!item.iconOnly && item.label}
                        </Link>
                    </li>
                ))}
                {user && (
                    <li>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'inherit',
                                font: 'inherit',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                width: '100%'
                            }}
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </li>
                )}
                <li>
                    <ThemeToggle />
                </li>
            </ul>
        </nav>
    );
}
