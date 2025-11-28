
import styles from './terms.module.css';

export default function TermsPage() {
    return (
        <div className={styles.termsPage}>
            <header className={styles.header}>
                <h1>Terms of Service</h1>
                <p>Last Updated: March 2024</p>
            </header>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using the Blitz T Club website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Membership</h2>
                    <p>Membership in Blitz T Club is open to Tesla owners and enthusiasts. Members must:</p>
                    <ul>
                        <li>Be at least 18 years of age</li>
                        <li>Provide accurate and complete registration information</li>
                        <li>Maintain current contact information</li>
                        <li>Comply with club rules and guidelines</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Events and Activities</h2>
                    <p>Participation in club events is subject to:</p>
                    <ul>
                        <li>Event-specific terms and conditions</li>
                        <li>Proper registration and RSVP procedures</li>
                        <li>Compliance with safety guidelines</li>
                        <li>Respect for other participants and organizers</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Code of Conduct</h2>
                    <p>Members are expected to:</p>
                    <ul>
                        <li>Treat all members with respect and courtesy</li>
                        <li>Follow all applicable laws and regulations</li>
                        <li>Maintain appropriate behavior at club events</li>
                        <li>Represent the club positively in public forums</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Privacy and Data</h2>
                    <p>We are committed to protecting your privacy. Please review our Privacy Policy for details on how we collect, use, and protect your information.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. Liability</h2>
                    <p>Blitz T Club is not liable for:</p>
                    <ul>
                        <li>Personal injury or property damage during events</li>
                        <li>Loss or theft of personal belongings</li>
                        <li>Actions of individual members</li>
                        <li>Technical issues with the website</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>7. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Members will be notified of significant changes via email or website announcements.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Contact</h2>
                    <p>For questions about these terms, please contact us at:</p>
                    <p className={styles.contactInfo}>Email: info@BlitzTClub.com</p>
                </section>
            </div>
        </div>
    );
}
