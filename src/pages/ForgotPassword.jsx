import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If an account exists, a password reset email has been sent.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🐾</div>
          <h1>Forgot Password?</h1>
          <p>
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-links">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;
