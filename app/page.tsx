import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';
import styles from './page.module.css';
import AuthErrorHandler from '@/components/AuthErrorHandler';

export default function Home() {
  return (
    <>
      <AuthErrorHandler />
      <main className={styles.main}>
        <div className={styles.heroBackground}>
          <img
            src="https://cdn.teslanorth.com/wp-content/uploads/2025/10/tesla-model-y-family-october-2025-hero.jpg"
            alt="Tesla Background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -2
            }}
          />
          <div className={styles.heroOverlay} />
        </div>
        <section className="hero" id="home">
          <div className="hero-logo">
            <img
              src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
              alt="Blitz Tesla Club Logo"
              width="200"
              height="200"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
          <h1 className="hero-tagline">
            Experience the <span style={{ whiteSpace: 'nowrap' }}>Future</span> of Driving
          </h1>
          <div className="cta-buttons">
            <Link href="/register" className="btn">
              Join Now
            </Link>
            <Link href="/events" className="btn btn-outline">
              Upcoming Events
            </Link>
          </div>
          <div className="scroll-indicator">
            <FaChevronDown />
          </div>
        </section>
      </main>
    </>
  );
}
