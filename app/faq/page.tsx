
'use client';

import { useState } from 'react';
import { FaUsers, FaCalendarAlt, FaGift, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Link from 'next/link';
import styles from './faq.module.css';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    title: string;
    icon: React.ReactNode;
    items: FAQItem[];
}

const faqData: FAQSection[] = [
    {
        title: 'Membership',
        icon: <FaUsers />,
        items: [
            {
                question: 'How do I become a member of Blitz T Club?',
                answer: "To become a member, simply visit our registration page and fill out the membership form. You'll need to provide basic information and verify your Tesla ownership. Once approved, you'll receive your member QR code and access to exclusive benefits."
            },
            {
                question: 'Is membership free?',
                answer: 'Yes, membership to Blitz T Club is completely free! We believe in building an inclusive community for all Tesla owners without any membership fees.'
            },
            {
                question: 'Do I need to own a Tesla to join?',
                answer: 'Yes, Blitz T Club is specifically for Tesla owners. We require verification of Tesla ownership to maintain the integrity of our community and ensure our member benefits are available to actual Tesla owners.'
            },
            {
                question: 'How do I access my member QR code?',
                answer: 'Once your membership is approved, you can access your QR code by logging into your dashboard. The QR code is used to redeem exclusive member benefits at our partner locations.'
            }
        ]
    },
    {
        title: 'Events',
        icon: <FaCalendarAlt />,
        items: [
            {
                question: 'How often do you host events?',
                answer: 'We host events throughout the year, typically 2-3 major events per month. These include meetups, drives, educational sessions, and special Tesla-related activities. Check our events page for the latest schedule.'
            },
            {
                question: 'Are events open to non-members?',
                answer: 'Most of our events are exclusive to Blitz T Club members. However, we occasionally host public events to introduce potential members to our community. Check individual event details for specific requirements.'
            },
            {
                question: 'How do I register for events?',
                answer: "Event registration is available through our events page. Simply click on the event you're interested in and follow the registration process. Some events may have limited capacity, so early registration is recommended."
            }
        ]
    },
    {
        title: 'Member Benefits',
        icon: <FaGift />,
        items: [
            {
                question: 'What exclusive benefits do members receive?',
                answer: 'Members enjoy exclusive discounts and offers from our partner businesses, including EE Auto Group for window tinting, access to member-only events, networking opportunities, and a supportive community of fellow Tesla owners.'
            },
            {
                question: 'How do I redeem member benefits?',
                answer: 'To redeem benefits, simply show your member QR code to the partner business. Each partner has specific redemption procedures, which are detailed on our member benefits page.'
            },
            {
                question: 'Are member benefits available immediately after joining?',
                answer: 'Yes! Once your membership is approved and you receive your QR code, you can immediately start using all member benefits at our partner locations.'
            }
        ]
    },
    {
        title: 'Technical Support',
        icon: <FaCog />,
        items: [
            {
                question: "I'm having trouble logging into my account",
                answer: 'If you\'re experiencing login issues, try resetting your password using the "Forgot Password" link on the login page. If problems persist, contact our support team for assistance.'
            },
            {
                question: "My QR code isn't working",
                answer: "Ensure you're logged into your account and try refreshing the page. If the QR code still doesn't appear, contact our support team and we'll help you resolve the issue."
            },
            {
                question: 'How do I update my member information?',
                answer: 'You can update your member information by logging into your dashboard and accessing the profile settings. Make sure to save your changes after updating any information.'
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleFAQ = (index: string) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.faqPage}>
            <section className={styles.hero}>
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about Blitz T Club membership, events, and benefits.</p>
            </section>

            <div className={styles.container}>
                {faqData.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={styles.section}>
                        <h2>
                            <span className={styles.icon}>{section.icon}</span>
                            {section.title}
                        </h2>
                        <div className={styles.items}>
                            {section.items.map((item, itemIndex) => {
                                const index = `${sectionIndex}-${itemIndex}`;
                                const isOpen = openIndex === index;
                                return (
                                    <div key={itemIndex} className={styles.item}>
                                        <button
                                            className={`${styles.question} ${isOpen ? styles.active : ''}`}
                                            onClick={() => toggleFAQ(index)}
                                            aria-expanded={isOpen}
                                        >
                                            {item.question}
                                            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                        <div className={`${styles.answer} ${isOpen ? styles.open : ''}`}>
                                            <p>{item.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className={styles.contactSection}>
                    <h2>Still Have Questions?</h2>
                    <p>Can't find what you're looking for? Our team is here to help!</p>
                    <Link href="/contact" className={styles.contactBtn}>Contact Us</Link>
                </div>
            </div>
        </div>
    );
}
