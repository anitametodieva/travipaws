import { useState } from "react";
import { supabase } from "../services/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("If an account exists, a password reset email has been sent.");
  }

  return (
    <main>
      <h1>Forgot Password</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Reset Password"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
  );
}

export default ForgotPassword;