import { useState } from "react";
import { FaPaw, FaBars, FaTimes } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import "./Header.css";

export default function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    closeMenu();
    navigate("/login", { replace: true });
  }

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <header className="site-header">
      <div className="header-container">
        <NavLink to="/" className="logo" onClick={closeMenu}>
          <FaPaw className="logo-icon" />
          <span>Travipaws</span>
        </NavLink>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="header-menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div
          id="header-menu"
          className={`header-menu ${menuOpen ? "open" : ""}`}
        >
          <nav className="navigation" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/trips" className={navLinkClass} onClick={closeMenu}>
              Explore
            </NavLink>

            <NavLink to="/about" className={navLinkClass} onClick={closeMenu}>
              About
            </NavLink>
          </nav>

          <div className="auth-actions">
            {loading ? null : user ? (
              <>
                <NavLink
                  to="/trips/create"
                  className="register-button"
                  onClick={closeMenu}
                >
                  Create Trip
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="login-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="login-button"
                  onClick={closeMenu}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="register-button"
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
