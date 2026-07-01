import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

/**
 * LOGIN PAGE
 * Handles user authentication using Firebase email/password
 */
export default function Login() {
    // form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * HANDLE LOGIN
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Firebase login request
            await signInWithEmailAndPassword(auth, email, password);

            alert("Login successful!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={handleLogin}
                className="w-80 p-6 bg-white shadow rounded"
            >
                <h1 className="text-xl font-bold mb-4">Login</h1>

                {/* Email input */}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password input */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Error display */}
                {error && (
                    <p className="text-red-500 text-sm mb-2">
                        {error}
                    </p>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}