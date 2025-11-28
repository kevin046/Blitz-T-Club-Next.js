
'use client';

import { useState, useEffect } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaUsers, FaCheckCircle, FaExclamationCircle, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { FaSquareXTwitter, FaInstagram, FaYoutube } from 'react-icons/fa6';
import styles from './contact.module.css';

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            setShowSuccess(true);
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        setIsSubmitting(true);
        // The form actually submits to formsubmit.co, so we don't prevent default here unless we want to handle it via AJAX
        // But the original code used standard form submission.
        // To keep it simple and working with formsubmit.co, we let it submit.
        // We just show the loading state.
        setTimeout(() => {
            setIsSubmitting(false);
        }, 5000);
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.floatingShapes}>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
            </div>

            <div className={styles.contactContainer}>
                <div className={styles.contactHeader}>
                    <h1>Get in Touch</h1>
                    <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '2rem' }}>Contact Information</h2>

                        <div className={styles.contactMethods}>
                            <div className={styles.contactMethod}>
                                <div className={styles.contactIcon}>
                                    <FaEnvelope />
                                </div>
                                <div className={styles.contactDetails}>
                                    <h3>Email Us</h3>
                                    <p>info@blitztclub.com</p>
                                </div>
                            </div>

                            <div className={styles.contactMethod}>
                                <div className={styles.contactIcon}>
                                    <FaMapMarkerAlt />
                                </div>
                                <div className={styles.contactDetails}>
                                    <h3>Location</h3>
                                    <p>Greater Toronto Area, Ontario, Canada</p>
                                </div>
                            </div>

                            <div className={styles.contactMethod}>
                                <div className={styles.contactIcon}>
                                    <FaClock />
                                </div>
                                <div className={styles.contactDetails}>
                                    <h3>Response Time</h3>
                                    <p>We typically respond within 24 hours</p>
                                </div>
                            </div>

                            <div className={styles.contactMethod}>
                                <div className={styles.contactIcon}>
                                    <FaUsers />
                                </div>
                                <div className={styles.contactDetails}>
                                    <h3>Community</h3>
                                    <p>Join our Tesla community and stay connected</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.socialLinks}>
                            <a href="https://x.com/BlitzTClub" target="_blank" className={styles.socialLink} aria-label="Follow us on X">
                                <FaSquareXTwitter />
                            </a>
                            <a href="https://www.instagram.com/blitztclub/" target="_blank" className={styles.socialLink} aria-label="Follow us on Instagram">
                                <FaInstagram />
                            </a>
                            <a href="https://www.youtube.com/@BlitzTClub-Toronto" target="_blank" className={styles.socialLink} aria-label="Subscribe to our YouTube">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    <div className={styles.contactFormContainer}>
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '2rem' }}>Send us a Message</h2>

                        {showSuccess && (
                            <div className={styles.successMessage} id="successMessage" style={{ display: 'block' }}>
                                <FaCheckCircle />
                                <strong>Message sent successfully!</strong><br />
                                <small style={{ opacity: 0.9, marginTop: '0.5rem', display: 'block' }}>
                                    Thank you for contacting us. We'll get back to you within 24 hours.
                                </small>
                            </div>
                        )}

                        <form className={styles.contactForm} id="contactForm" action="https://formsubmit.co/info@blitztclub.com" method="POST" onSubmit={handleSubmit}>
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_subject" value="New Contact Form Message - Blitz T Club" />
                            <input type="hidden" name="_captcha" value="false" />
                            <input type="hidden" name="_next" value="https://blitztclub.com/contact?success=true" />

                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name *</label>
                                <input type="text" id="name" name="name" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address *</label>
                                <input type="email" id="email" name="email" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="memberId">Member ID (Optional)</label>
                                <input type="text" id="memberId" name="memberId" placeholder="Your Blitz T Club member ID" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject *</label>
                                <select id="subject" name="subject" required>
                                    <option value="">Select a subject</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Membership Question">Membership Question</option>
                                    <option value="Event Information">Event Information</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message *</label>
                                <textarea id="message" name="message" placeholder="Tell us how we can help you..." required></textarea>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="fa-spin" /> Sending...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
