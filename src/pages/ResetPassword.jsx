import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../services/supabaseClient";

function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setMessage("Password updated successfully!");

        setTimeout(() => {
            navigate("/login");
        }, 2000);
    }

    return (
        <main>
            <h1>Reset Password</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">New Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />
                </div>

                {error && <p role="alert">{error}</p>}
                {message && <p>{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </main>
    );
}

export default ResetPassword;