
import Link from 'next/link';
import { FaInstagram, FaSquareXTwitter } from 'react-icons/fa6'; // Using fa6 for X icon if available, or fallback

export default function Footer() {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <div className="footer-links">
                        <Link href="/">Home</Link>
                        <Link href="/events">Events</Link>
                        <Link href="/gallery">Gallery</Link>
                        <Link href="/contact">Contact</Link>
                        <Link href="/faq">FAQ</Link>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Member Area</h3>
                    <div className="footer-links">
                        <Link href="/sponsors">Our Sponsors</Link>
                        <Link href="/member-benefits">Member Benefits</Link>
                        {/* Logout is handled in Navigation, but we can add a link here if needed, or just keep it simple */}
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Legal</h3>
                    <div className="footer-links">
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/about">About Us</Link>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Connect With Us</h3>
                    <div className="footer-social">
                        <a href="https://x.com/BlitzTClub" target="_blank" rel="noopener" aria-label="Follow us on X">
                            <FaSquareXTwitter />
                        </a>
                        <a href="https://www.instagram.com/blitztclub/" target="_blank" rel="noopener" aria-label="Follow us on Instagram">
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 Blitz T Club. All rights reserved.</p>
                <p className="powered-by">
                    Website powered by <a href="http://www.summitpixels.com" target="_blank" rel="noopener">SummitPixels</a>
                </p>
            </div>
        </footer>
    );
}
