import "./Header.css";
import { FaPaw } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <NavLink to="/" className="logo">
          <FaPaw className="logo-icon" />
          <span>Travipaws</span>
        </NavLink>

        <nav className="navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/trips"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Explore
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            About
          </NavLink>
        </nav>

        <div className="auth-actions">
          {loading ? null : user ? (
            <>
              <NavLink to="/trips/create" className="register-button">
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
              <NavLink to="/login" className="login-button">
                Login
              </NavLink>

              <NavLink to="/register" className="register-button">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
