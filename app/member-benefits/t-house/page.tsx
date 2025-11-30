'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaCar, FaMapMarkerAlt, FaPhone, FaGlobe, FaArrowLeft, FaInfoCircle, FaPalette, FaTools, FaFilePdf, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import styles from '../member-benefits.module.css';

export default function THousePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/member-benefits/t-house');
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
                    <p>Verifying membership...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.benefitsPage}>
            <Link href="/member-benefits" className={styles.backButton}>
                <FaArrowLeft /> Back to Member Benefits
            </Link>

            <header className={styles.header}>
                <h1><span className={styles.brandHighlight}>T-House</span> Toronto - Black Friday Boxing Day Sale</h1>
                <p>Exclusive Tesla customization and upgrade deals for Blitz T Club members</p>
                <a
                    href="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/PDF/thouse.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewDetailsBtn}
                    style={{ display: 'inline-flex', marginTop: '1.5rem', width: 'auto' }}
                >
                    <FaFilePdf /> View Promotion Flyer
                </a>
            </header>

            <div className={styles.cardsContainer}>
                {/* Color Wrapping Section */}
                <div className={styles.card}>
                    <div className={styles.vendorLogo} style={{ padding: '15px', background: 'radial-gradient(circle at center, #4a4a4a 0%, #1a1a1a 100%)', borderColor: '#333' }}>
                        <img
                            src="https://static.wixstatic.com/media/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png/v1/fill/w_113,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png"
                            alt="T-House Logo"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    <h2><FaPalette /> Color Change Wrapping (改色贴膜)</h2>

                    <div className={styles.dealDetails}>
                        <strong>Special Member Pricing: $2,200 CAD per vehicle</strong>
                    </div>

                    <div className={styles.infoBox} style={{ backgroundColor: 'rgba(232, 33, 39, 0.15)', border: '1px solid rgba(232, 33, 39, 0.3)' }}>
                        <FaInfoCircle size={32} />
                        <div>
                            <strong>Limited Time Offer</strong>
                            <span className={styles.paymentDetail}>Price applies to non-white vehicles without disassembly</span>
                            <span className={styles.paymentDetail}>First come, first served - limited quantities available</span>
                            <span className={styles.paymentDetail}>Each color has only ONE roll available!</span>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <h3 style={{ padding: '1rem', margin: 0, background: 'var(--color-background-gray)', color: 'var(--color-text-primary)' }}>Available Colors (限定颜色)</h3>
                        <table className={styles.dealTable}>
                            <tbody>
                                <tr><td>Liquid Metal Silver (液态金属银)</td></tr>
                                <tr><td>Ultra Matte Black Purple (超哑黑幻紫)</td></tr>
                                <tr><td>Dual-Tone Dream Volcanic Ash (双色梦幻火山灰)</td></tr>
                                <tr><td>Flower Pink (花悦粉)</td></tr>
                                <tr><td>Mercedes Emerald Green (奔驰祖母石绿)</td></tr>
                                <tr><td>Khaki Milan (卡其米兰)</td></tr>
                                <tr><td>Liquid Metal Gunmetal (液态金属枪灰)</td></tr>
                                <tr><td>Dragon Blood Red (龙血红)</td></tr>
                                <tr><td>Dual-Tone Dream Gray Charming Purple (双色梦幻灰魅紫)</td></tr>
                                <tr><td>Diamond Concubine Smile (钻石妃子笑)</td></tr>
                                <tr><td>Pearl White (珠光白)</td></tr>
                                <tr><td>Pepper White (胡椒白)</td></tr>
                                <tr><td>Ultra Matte AMG Mountain Ash (超哑AMG山灰)</td></tr>
                                <tr><td>Crystal Glacier Blue (水晶冰川蓝)</td></tr>
                                <tr><td>Capri Gray Purple Matte (卡普里灰紫（哑面）)</td></tr>
                                <tr><td>Beetroot Purple (甜菜根紫)</td></tr>
                                <tr><td>Khaki Green (卡其绿)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tesla Upgrades Section */}
                <div className={styles.card}>
                    <h2><FaTools /> Tesla Upgrade Accessories</h2>

                    <div className={styles.dealDetails}>
                        Black Friday Boxing Day Special Pricing - Limited Quantities!
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.dealTable}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className={styles.textCenter}>Regular Price</th>
                                    <th className={styles.textCenter}>Sale Price</th>
                                    <th className={styles.textCenter}>You Save</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td data-label="Product">Model Y Navigator Lights (领航灯)<br /><small>Zebra Series / Light Motion Series</small></td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$500</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$298/set</td>
                                    <td data-label="You Save" className={styles.savings}>$202 (40%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">Model 3 Highland / Juniper YOKE Steering Wheel</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$480</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$380</td>
                                    <td data-label="You Save" className={styles.savings}>$100 (21%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">Model 3 Highland Shift Paddles (换挡拨杆)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$580</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$400/set</td>
                                    <td data-label="You Save" className={styles.savings}>$180 (31%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">Model Y Juniper Shift Paddles (换挡拨杆)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$580</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$400/set</td>
                                    <td data-label="You Save" className={styles.savings}>$180 (31%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">Model Y / Highland / Juniper 360° Full Floor Mats (全包脚垫)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$699</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$560</td>
                                    <td data-label="You Save" className={styles.savings}>$139 (20%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">Model Y / Juniper Electric Sunshade (电动遮阳帘)</td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$799</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$640</td>
                                    <td data-label="You Save" className={styles.savings}>$159 (20%)</td>
                                </tr>
                                <tr>
                                    <td data-label="Product">HaloBLK Disc<br /><small>19", 20", 21" wheels available (limited stock)</small></td>
                                    <td data-label="Regular Price" className={styles.regularPrice}>$340</td>
                                    <td data-label="Sale Price" className={styles.memberPrice}>$228/set</td>
                                    <td data-label="You Save" className={styles.savings}>$112 (33%)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.infoBox} style={{ backgroundColor: 'rgba(21, 101, 192, 0.15)', border: '1px solid rgba(21, 101, 192, 0.3)' }}>
                        <FaInfoCircle size={32} />
                        <span><strong>Stock Notice:</strong> Limited quantities available. First come, first served. Please contact T-House to confirm availability before visiting.</span>
                    </div>
                </div>

                {/* Contact Information */}
                <div className={styles.card}>
                    <div className={styles.contactInfo}>
                        <div className={styles.contactHeader}>
                            <div className={styles.vendorName}>T-House Toronto</div>
                            <div className={styles.vendorSub}>Tesla Customization Specialists</div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaMapMarkerAlt /> Location</div>
                            <div className={styles.blockContent}>
                                876 Magnetic Dr<br />
                                North York, ON<br />
                                CANADA
                            </div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaPhone /> Contact</div>
                            <div className={styles.blockContent}>
                                <div style={{ marginBottom: '0.3rem' }}>
                                    <a href="tel:416-736-6888" className={styles.phoneLink}>Tel: 416-736-6888</a>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contactBlock}>
                            <div className={styles.blockTitle}><FaGlobe /> Website</div>
                            <div className={styles.blockContent}>
                                <a href="https://www.thousetoronto.com" target="_blank" rel="noopener noreferrer" className={styles.phoneLink}>
                                    www.thousetoronto.com
                                </a>
                            </div>
                        </div>

                        <div className={styles.contactFooter}>
                            <FaInfoCircle /> For questions, to confirm availability, or to book your appointment, contact T-House directly.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
