'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaCalendar, FaImages, FaGift, FaEnvelope, FaInfoCircle, FaUserPlus, FaSignInAlt, FaBars, FaTimes, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        document.body.classList.toggle('nav-open', !isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.classList.remove('nav-open');
    };

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        closeMenu();
        await signOut();
    };

    const navItems = [
        { href: '/', icon: FaHome, label: '', iconOnly: true },
        { href: '/events', icon: FaCalendar, label: 'Events' },
        { href: '/gallery', icon: FaImages, label: 'Gallery' },
        { href: '/member-benefits', icon: FaGift, label: 'Member Benefits' },
        { href: '/contact', icon: FaEnvelope, label: 'Contact' },
        { href: '/about', icon: FaInfoCircle, label: 'About Us' },
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

                {/* Auth Dependent Items */}
                {mounted && user ? (
                    <>
                        <li>
                            <Link
                                href="/dashboard"
                                className={pathname === '/dashboard' ? 'active' : ''}
                                onClick={closeMenu}
                            >
                                <FaTachometerAlt />
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <a href="#" onClick={handleSignOut} className="logout-btn">
                                <FaSignOutAlt />
                                Logout
                            </a>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                href="/register"
                                className={pathname === '/register' ? 'active' : ''}
                                onClick={closeMenu}
                            >
                                <FaUserPlus />
                                Join Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/login"
                                className={pathname === '/login' ? 'active' : ''}
                                onClick={closeMenu}
                            >
                                <FaSignInAlt />
                                Login
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}