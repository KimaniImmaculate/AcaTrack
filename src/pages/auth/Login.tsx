import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../services/firebase";

/**
 * LOGIN PAGE
 *
 * Authenticates a user using Firebase
 * and redirects them based on their role.
 */
export default function Login() {
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * Handles user login.
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            /**
             * Authenticate the user.
             */
            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            /**
             * Retrieve the user's role
             * from Firestore.
             */
            const userDoc = await getDoc(
                doc(db, "users", credential.user.uid)
            );

            if (!userDoc.exists()) {
                setError("User profile not found.");
                return;
            }

            const role = userDoc.data().role;

            /**
             * Redirect based on role.
             */
            switch (role) {
                case "student":
                    navigate("/student");
                    break;

                case "supervisor":
                    navigate("/supervisor");
                    break;

                case "admin":
                    navigate("/admin");
                    break;

                default:
                    navigate("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm rounded-lg bg-white p-6 shadow"
            >
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="mb-4 w-full rounded border p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="mb-4 w-full rounded border p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p className="mb-4 text-sm text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>

        </div>
    );
}