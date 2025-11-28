
import styles from './privacy.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.privacyPage}>
            <header className={styles.header}>
                <h1>Privacy Policy</h1>
                <p>Last Updated: March 2024</p>
            </header>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul>
                        <li>Name and contact information</li>
                        <li>Account credentials</li>
                        <li>Vehicle information</li>
                        <li>Event participation details</li>
                        <li>Communication preferences</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul>
                        <li>Manage your club membership</li>
                        <li>Organize and coordinate events</li>
                        <li>Send newsletters and updates</li>
                        <li>Improve our services</li>
                        <li>Ensure club safety and security</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Information Sharing</h2>
                    <p>We do not sell or rent your personal information. We may share information with:</p>
                    <ul>
                        <li>Event partners and sponsors (with consent)</li>
                        <li>Service providers helping operate our club</li>
                        <li>Legal authorities when required by law</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Data Security</h2>
                    <p>We implement appropriate security measures to protect your information, including:</p>
                    <ul>
                        <li>Encryption of sensitive data</li>
                        <li>Secure server infrastructure</li>
                        <li>Regular security audits</li>
                        <li>Access controls and monitoring</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal information</li>
                        <li>Request corrections to your data</li>
                        <li>Opt-out of communications</li>
                        <li>Request data deletion</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>6. Contact Us</h2>
                    <p>For privacy-related inquiries, please contact us at:</p>
                    <p className={styles.contactInfo}>Email: info@BlitzTClub.com</p>
                </section>
            </div>
        </div>
    );
}
