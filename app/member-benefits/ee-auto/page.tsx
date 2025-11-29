'use client';

import { FaShieldAlt, FaCreditCard, FaQrcode, FaClock, FaMapMarkerAlt, FaPhone, FaWeixin, FaInfoCircle, FaStar, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import styles from '../member-benefits.module.css';

export default function EEAutoPage() {
    return (
        <div className={styles.benefitsPage}>
            <Link href="/member-benefits" className={styles.backButton}>
                <FaArrowLeft /> Back to Member Benefits
            </Link>

            <header className={styles.header}>
                <h1><span className={styles.brandHighlight}>EE</span> Auto - Window Tinting Special</h1>
                <p>Exclusive member pricing on professional window tinting services</p>
            </header>

            <div className={styles.cardsContainer}>
                <div className={styles.card}>
                    <div className={styles.vendorLogo}>
                        <img src="https://static.wixstatic.com/media/fd0f3d_855a3d7ef5fb4fd0b2011973fa0a9e6a~mv2.jpg/v1/fill/w_125,h_125,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20181225133337.jpg" alt="EE Auto Logo" />
                    </div>

                    <div className={styles.dealDetails}>
                        <strong>Blitz T Club Member Pricing</strong> – Show your membership and save on professional window tinting for your Tesla or other vehicles!
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.dealTable}>
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th className={styles.textCenter}>Regular Price</th>
                                    <th className={styles.textCenter}>Member Price</th>
                                    <th className={styles.textCenter}>You Save</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td data-label="Service">Driver & Passenger (Regular)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$150</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$100</td>
                                    <td data-label="You Save" className={styles.savings}>$50 (33%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Service">Driver & Passenger (IR Ceramic)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$200</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$150</td>
                                    <td data-label="You Save" className={styles.savings}>$50 (25%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Service">Windshield (Regular)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$170</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$130</td>
                                    <td data-label="You Save" className={styles.savings}>$40 (24%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Service">All Except Windshield/Sunroof (Regular)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$250-$270</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$200</td>
                                    <td data-label="You Save" className={styles.savings}>$50-$70 (20-26%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Service">All Except Windshield/Sunroof (IR Ceramic)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$450-$470</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$270</td>
                                    <td data-label="You Save" className={styles.savings}>$180-$200 (40-43%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Service">ALL IN ONE Deal (IR Ceramic, All Except Sunroof)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$620-$640</td>
                                    <td data-label="Member Price" className={styles.memberPrice}>$400</td>
                                    <td data-label="You Save" className={styles.savings}>$220-$240 (35-38%)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.infoBox} style={{ backgroundColor: 'rgba(21, 101, 192, 0.15)', border: '1px solid rgba(21, 101, 192, 0.3)' }}>
                        <FaShieldAlt size={32} />
                        <span><strong>Lifetime Warranty:</strong> All window tinting services include a lifetime warranty for your peace of mind.</span>
                    </div>

                    <div className={styles.infoBox} style={{ backgroundColor: 'rgba(194, 24, 91, 0.15)', border: '1px solid rgba(194, 24, 91, 0.3)' }}>
                        <FaCreditCard size={32} />
                        <div>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Payment Information</strong>
                            <span className={styles.paymentDetail}>Cash is preferred.</span>
                            <span className={styles.paymentDetail}>Paying by <strong>cash</strong>: <u>Tax is included</u> (no additional charge).</span>
                            <span className={styles.paymentDetail}>Paying by <strong>credit card</strong>: <u>13% HST will be added</u> to the total.</span>
                        </div>
                    </div>

                    <div className={styles.infoBox} style={{ backgroundColor: 'rgba(118, 75, 162, 0.15)', border: '1px solid rgba(118, 75, 162, 0.3)' }}>
                        <FaQrcode size={32} />
                        <div>
                            <strong>How to Redeem:</strong> Please have your Blitz T Club member QR code scanned by EE Auto staff to access these exclusive prices.
                            <br />
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9em' }}>No QR, no deal – this offer is for verified members only.</span>
                        </div>
                    </div>

                    <div className={styles.qrSection}>
                        <img src="https://i.ibb.co/nqSSL0FX/eeauto-QR.jpg" alt="EE Auto QR Code" />
                        <div className={styles.qrCaption}>Scan this QR code for WeChat contact</div>
                    </div>

                    <div className={styles.contactInfo}>
                        <div className={styles.contactHeader}>
                            <div className={styles.vendorName}>EE Auto Group</div>
                            <div className={styles.vendorSub}>Professional Window Tinting</div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaClock /> Opening Hours</div>
                            <div className={styles.blockContent}>
                                <div><strong>Mon - Fri:</strong> 11am - 8pm</div>
                                <div><strong>Sat - Sun:</strong> 11am - 8pm</div>
                            </div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaMapMarkerAlt /> Window Tinting Shop</div>
                            <div className={styles.blockContent}>
                                50 Bullock Drive, Unit 3<br />
                                Markham, ON, CANADA L3P 3P2
                            </div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaPhone /> Contact</div>
                            <div className={styles.blockContent}>
                                <div style={{ marginBottom: '0.3rem' }}>
                                    <a href="tel:647-772-7072" className={styles.phoneLink}>Tel: 647-772-7072</a>
                                </div>
                                <div>
                                    <FaWeixin style={{ color: '#07c160', marginRight: '0.3rem' }} />
                                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>WeChat:</span> <span style={{ color: '#888' }}>Scan QR code above</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contactFooter}>
                            <FaInfoCircle /> For questions or to book your appointment, contact EE Auto Group directly.<br />
                            <a href="https://www.ee-auto.com/contact-us" target="_blank" rel="noopener noreferrer">Visit EE Auto Group Website</a>
                        </div>
                    </div>
                </div>
            </div>

            <section className={styles.gallerySection}>
                <h3>Before & After Gallery</h3>
                <p>See the difference professional window tinting makes on various vehicles</p>

                <div className={styles.galleryGrid}>
                    {[
                        "https://i.ibb.co/MDr6jStW/a4c6cdb2506c34b2813a080676856683.jpg",
                        "https://i.ibb.co/Psx00t9x/b6f5d67218ea0d93a244f675e624ca32.jpg",
                        "https://i.ibb.co/9HB6yW6X/987823029084f848ed8b22fe9c97a2a8.jpg",
                        "https://i.ibb.co/Vcmggt8X/715de9e03cce781757752cd9342b1612.jpg",
                        "https://i.ibb.co/7HSqv52/d589d4c158ea107cebbbfc72ae11b9ba.jpg",
                        "https://i.ibb.co/SD4Xb8RJ/eb536733d90ff1fa28faf2d03e57cb4f.jpg",
                        "https://i.ibb.co/QFYntMD4/7a95e0685f2896344e00eb8ac9573049.jpg"
                    ].map((src, index) => (
                        <div key={index} className={styles.galleryItem}>
                            <img src={src} alt={`Window Tinting Before/After ${index + 1}`} />
                        </div>
                    ))}
                </div>

                <div className={styles.qualityBadge}>
                    <FaStar />
                    <strong>Professional Quality:</strong> All work completed with precision and attention to detail
                </div>
            </section>
        </div>
    );
}
