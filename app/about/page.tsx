
import { FaUsers, FaLeaf, FaGraduationCap, FaHandshake } from 'react-icons/fa';
import styles from './about.module.css';

export default function About() {
    return (
        <div className={styles.aboutPage}>
            <div className={styles.aboutContainer}>
                <header className={styles.aboutHeader}>
                    <h1>Blitz T Club Corporation</h1>
                    <p>Empowering Tesla Owners Through Community</p>
                </header>

                <section className={styles.missionSection}>
                    <div className={styles.missionContent}>
                        <h2>Our Mission</h2>
                        <p>
                            As a non-profit organization, Blitz T Club is dedicated to creating a vibrant community for Tesla owners,
                            enthusiasts, and supporters of sustainable transportation. We strive to enhance the Tesla ownership
                            experience through education, events, and mutual support.
                        </p>
                    </div>
                </section>

                <section className={styles.journeySection}>
                    <h2>Our Journey</h2>
                    <div className={styles.timeline}>
                        <div className={styles.milestone}>
                            <h3>2023</h3>
                            <p>
                                Founded as a community club with just over 20 passionate Tesla enthusiasts in Toronto, united by our
                                shared vision for sustainable transportation and innovation.
                            </p>
                        </div>
                        <div className={styles.milestone}>
                            <h3>2025</h3>
                            <p>
                                Incorporated as Blitz T Club Corporation, evolving into a thriving non-profit organization. Our
                                community has flourished to over 500 members, each contributing to our mission of promoting sustainable
                                mobility.
                            </p>
                        </div>
                        <div className={styles.milestone}>
                            <h3>2026</h3>
                            <p>
                                Pursuing Charity Status with the Canada Revenue Agency, marking our commitment to expanding community
                                initiatives and sustainable transportation advocacy across the region.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.valuesGrid}>
                    <div className={styles.valueCard}>
                        <FaUsers />
                        <h3>Community First</h3>
                        <p>
                            Building strong connections among Tesla owners through regular meetups, shared experiences, and
                            collaborative learning.
                        </p>
                    </div>

                    <div className={styles.valueCard}>
                        <FaLeaf />
                        <h3>Sustainability</h3>
                        <p>
                            Promoting sustainable transportation and supporting the transition to clean energy through education and
                            advocacy.
                        </p>
                    </div>

                    <div className={styles.valueCard}>
                        <FaGraduationCap />
                        <h3>Education</h3>
                        <p>
                            Providing resources and knowledge sharing opportunities to help members maximize their Tesla ownership
                            experience.
                        </p>
                    </div>

                    <div className={styles.valueCard}>
                        <FaHandshake />
                        <h3>Support Network</h3>
                        <p>
                            Creating a supportive environment where members can share advice, experiences, and assistance with fellow
                            Tesla owners.
                        </p>
                    </div>
                </section>

                <section className={styles.impactSection}>
                    <h2>Our Impact</h2>
                    <div className={styles.impactStats}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>500+</span>
                            <span className={styles.statLabel}>Active Members</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>30+</span>
                            <span className={styles.statLabel}>Events Hosted</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>1000+</span>
                            <span className={styles.statLabel}>Community Hours</span>
                        </div>
                    </div>
                </section>

                <section className={styles.joinSection}>
                    <h2>Join Our Community</h2>
                    <p>
                        Become part of a growing community of Tesla enthusiasts and help shape the future of sustainable
                        transportation.
                    </p>
                    <a href="/register" className={styles.joinBtn}>
                        Become a Member
                    </a>
                </section>
            </div>
        </div>
    );
}
