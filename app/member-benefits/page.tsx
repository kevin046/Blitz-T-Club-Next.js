
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaShieldAlt, FaCar, FaMapMarkerAlt, FaArrowRight, FaShoppingBag, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import DynamicJotformAI from '@/components/DynamicJotformAI';
import styles from './member-benefits.module.css';

export default function MemberBenefitsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/member-benefits');
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
            <header className={styles.header}>
                <h1>Member Benefits</h1>
                <p>Unlock exclusive deals and experiences as a Blitz T Club member. Enjoy special pricing and perks from our trusted partners.</p>
            </header>

            <div className={styles.vendorGrid}>
                {/* EE Auto Vendor Card */}
                <Link href="/member-benefits/ee-auto" className={styles.vendorCard}>
                    <div className={styles.vendorBanner} style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}>
                        <div className={styles.vendorLogo} style={{ padding: '15px', background: 'radial-gradient(circle at center, #4a4a4a 0%, #1a1a1a 100%)', borderColor: '#333' }}>
                            <img
                                src="https://static.wixstatic.com/media/fd0f3d_855a3d7ef5fb4fd0b2011973fa0a9e6a~mv2.jpg/v1/fill/w_125,h_125,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20181225133337.jpg"
                                alt="EE Auto Logo"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                            />
                        </div>
                    </div>

                    <div className={styles.vendorContent}>
                        <h2 className={styles.vendorName}>
                            <span className={styles.brandHighlight}>EE</span> Auto
                        </h2>
                        <p className={styles.vendorCategory}>
                            <FaCar /> Window Tinting Services
                        </p>

                        <div className={styles.vendorOffers}>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Up to 43% OFF Window Tinting</span>
                            </div>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Lifetime Warranty Included</span>
                            </div>
                        </div>

                        <div className={styles.vendorLocation}>
                            <FaMapMarkerAlt />
                            <span>Markham, ON</span>
                        </div>

                        <div className={styles.viewDetailsBtn}>
                            View Details <FaArrowRight />
                        </div>
                    </div>
                </Link>

                {/* T-House Vendor Card */}
                <Link href="/member-benefits/t-house" className={styles.vendorCard}>
                    <div className={styles.vendorBanner} style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}>
                        <div className={styles.vendorLogo} style={{ padding: '15px', background: 'radial-gradient(circle at center, #4a4a4a 0%, #1a1a1a 100%)', borderColor: '#333' }}>
                            <img
                                src="https://static.wixstatic.com/media/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png/v1/fill/w_113,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/50c807_42ad4abd00e24074baa45e4ccdfc7d16~mv2.png"
                                alt="T-House Logo"
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <div className={styles.vendorContent}>
                        <h2 className={styles.vendorName}>
                            <span className={styles.brandHighlight}>T-House</span> Toronto
                        </h2>
                        <p className={styles.vendorCategory}>
                            <FaCar /> Tesla Customization & Accessories
                        </p>

                        <div className={styles.vendorOffers}>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Black Friday Boxing Day Sale</span>
                            </div>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Color Wraps from $2,200 CAD</span>
                            </div>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Tesla Upgrades & Accessories</span>
                            </div>
                        </div>

                        <div className={styles.vendorLocation}>
                            <FaMapMarkerAlt />
                            <span>North York, ON</span>
                        </div>

                        <div className={styles.viewDetailsBtn}>
                            View Details <FaArrowRight />
                        </div>
                    </div>
                </Link>

                {/* Blitz Shop Vendor Card */}
                <Link href="/shop" className={styles.vendorCard}>
                    <div className={styles.vendorBanner} style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}>
                        <div className={styles.vendorLogo} style={{ padding: '10px', background: 'radial-gradient(circle at center, #4a4a4a 0%, #1a1a1a 100%)', borderColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src="https://i.ibb.co/fkrdXZK/Logo4-white.png"
                                alt="Blitz Shop"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <div className={styles.vendorContent}>
                        <h2 className={styles.vendorName}>
                            <span className={styles.brandHighlight}>Blitz</span> Shop
                        </h2>
                        <p className={styles.vendorCategory}>
                            <FaShoppingBag /> Tesla Accessories
                        </p>

                        <div className={styles.vendorOffers}>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Near Book Value Pricing</span>
                            </div>
                            <div className={styles.offerHighlight}>
                                <FaShieldAlt />
                                <span>Exclusive Member Deals</span>
                            </div>
                        </div>

                        <div className={styles.vendorLocation}>
                            <FaMapMarkerAlt />
                            <span>Online Store</span>
                        </div>

                        <div className={styles.viewDetailsBtn}>
                            Shop Now <FaArrowRight />
                        </div>
                    </div>
                </Link>

                {/* Placeholder for more vendors */}
                <div className={styles.comingSoonCard}>
                    <div className={styles.comingSoonContent}>
                        <h3>More Partners Coming Soon!</h3>
                        <p>We're partnering with more premium vendors to bring you exclusive member benefits.</p>
                    </div>
                </div>
            </div>
            <DynamicJotformAI />
        </div>
    );
}
