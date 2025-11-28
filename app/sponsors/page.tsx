
'use client';

import { FaMapMarkerAlt, FaPhone, FaGlobe, FaWeixin } from 'react-icons/fa';
import Link from 'next/link';
import styles from './sponsors.module.css';

interface Sponsor {
    id: string;
    name: string;
    logo: string;
    category: string;
    description: string;
    benefits: string[];
    contact: {
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        wechat?: string;
    };
    ctaLink: string;
    ctaText: string;
}

const sponsors: Sponsor[] = [
    {
        id: 'ee-auto',
        name: 'EE Auto Group',
        logo: 'https://static.wixstatic.com/media/fd0f3d_855a3d7ef5fb4fd0b2011973fa0a9e6a~mv2.jpg/v1/fill/w_125,h_125,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20181225133337.jpg',
        category: 'Professional Window Tinting',
        description: 'EE Auto Group is a trusted partner of Blitz T Club, offering expert window tinting services for Tesla and other vehicles. Their team delivers high-quality results with a focus on customer satisfaction and attention to detail.',
        benefits: [
            'Special discounted pricing on all window tinting services for Blitz T Club members',
            'Lifetime warranty on all tinting services',
            'Tax included when paying by cash',
            'Show your Blitz T Club member QR code to redeem'
        ],
        contact: {
            address: '365 John Street, Unit 1, Thornhill, ON, Canada L3T 5W5',
            phone: '905-882-1112',
            wechat: 'Scan QR code at location',
            website: 'https://www.ee-auto.com/contact-us'
        },
        ctaLink: 'https://www.ee-auto.com/contact-us',
        ctaText: 'Book Your Tinting'
    }
];

export default function SponsorsPage() {
    return (
        <div className={styles.sponsorsPage}>
            <header className={styles.header}>
                <h1>Our Sponsors</h1>
                <p>Supporting the Tesla Community</p>
                <div className={styles.intro}>
                    <p>Blitz T Club is proud to partner with these outstanding organizations that help make our community events and member benefits possible. Our sponsors are carefully selected to provide value and quality services to our members.</p>
                </div>
            </header>

            <div className={styles.grid}>
                {sponsors.map(sponsor => (
                    <div key={sponsor.id} className={styles.card}>
                        <div className={styles.logoContainer}>
                            <img src={sponsor.logo} alt={`${sponsor.name} Logo`} />
                        </div>
                        <div className={styles.content}>
                            <h2>{sponsor.name}</h2>
                            <p className={styles.category}>{sponsor.category}</p>
                            <p className={styles.description}>{sponsor.description}</p>

                            <div className={styles.benefits}>
                                <h3>Exclusive Member Benefits</h3>
                                <ul>
                                    {sponsor.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                                <div className={styles.benefitsLink}>
                                    <Link href="/member-benefits">See full member pricing & details</Link>
                                </div>
                            </div>

                            <div className={styles.contact}>
                                {sponsor.contact.address && (
                                    <p><FaMapMarkerAlt /> {sponsor.contact.address}</p>
                                )}
                                {sponsor.contact.phone && (
                                    <p><FaPhone /> <a href={`tel:${sponsor.contact.phone}`}>{sponsor.contact.phone}</a></p>
                                )}
                                {sponsor.contact.wechat && (
                                    <p><FaWeixin className={styles.wechatIcon} /> WeChat: {sponsor.contact.wechat}</p>
                                )}
                                {sponsor.contact.website && (
                                    <p><FaGlobe /> <a href={sponsor.contact.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                                )}
                            </div>

                            <a href={sponsor.ctaLink} className={styles.ctaBtn} target="_blank" rel="noopener noreferrer">
                                {sponsor.ctaText}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <section className={styles.becomeSponsor}>
                <h2>Become a Sponsor</h2>
                <p>Join our growing community of sponsors and connect with passionate Tesla owners.</p>
                <Link href="/contact" className={styles.sponsorCta}>Contact Us</Link>
            </section>
        </div>
    );
}
