import './Footer.css';
import { FaPaw, FaInstagram, FaFacebookF } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <a href="/" className="footer-logo">
                        <FaPaw />
                        <span>Travipaws</span>
                    </a>

                    <p>Explore the world, together.</p>
                </div>

                <nav className="footer-navigation">
                    <a href="/">Home</a>
                    <a href="/trips">Explore</a>
                    <a href="/about">About</a>
                </nav>

                <div className="footer-socials">
                    <a href="#" aria-label="Instagram">
                        <FaInstagram />
                    </a>

                    <a href="#" aria-label="Facebook">
                        <FaFacebookF />
                    </a>
                </div>

                <p className="footer-copyright">
                    © 2026 Travipaws. All rights reserved.
                </p>
            </div>
        </footer>
    );
}