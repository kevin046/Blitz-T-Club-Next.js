'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.toggleBtn}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
    );
}
