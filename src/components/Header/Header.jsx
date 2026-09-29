import './Header.css';
import { FaPaw } from 'react-icons/fa';

export default function Header() {
    return (
        <header className="site-header">
            <div className="header-container">
                <a href="/" className="logo">
                    <FaPaw className="logo-icon" />
                    <span>Travipaws</span>
                </a>

                <nav className="navigation">
                    <a href="/" className="nav-link active">
                        Home
                    </a>

                    <a href="/trips" className="nav-link">
                        Explore
                    </a>

                    <a href="/about" className="nav-link">
                        About
                    </a>
                </nav>

                <div className="auth-actions">
                    <button className="login-button">Login</button>
                    <button className="register-button">Register</button>
                </div>
            </div>
        </header>
    );
}