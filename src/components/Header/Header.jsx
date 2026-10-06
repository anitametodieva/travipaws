import './Header.css';
import { FaPaw } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="site-header">
            <div className="header-container">
                <NavLink to="/" className="logo">
                    <FaPaw className="logo-icon" />
                    <span>Travipaws</span>
                </NavLink>

                <nav className="navigation">
                    <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Home
                    </NavLink>

                    <NavLink to="/trips" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Explore
                    </NavLink>

                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        About
                    </NavLink>
                </nav>

                <div className="auth-actions">
                    <NavLink to="/login" className="login-button">Login</NavLink>
                    <NavLink to="/register" className="register-button">Register</NavLink>
                </div>
            </div>
        </header>
    );
}