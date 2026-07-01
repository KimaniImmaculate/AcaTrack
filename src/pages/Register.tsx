import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * REGISTER PAGE
 * - Creates a new user in Firebase Authentication
 * - Automatically logs them in after signup
 */
export default function Register() {
    // form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * HANDLE REGISTER
     */
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            /**
             * 1. Create user in Firebase Auth
             */
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            /**
             * 2. Save user role in Firestore
             * Default role = student
             */
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "student",
                createdAt: new Date()
            });

            alert("Account created successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={handleRegister}
                className="w-80 p-6 bg-white shadow rounded"
            >
                <h1 className="text-xl font-bold mb-4">Register</h1>

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

                {/* Error message */}
                {error && (
                    <p className="text-red-500 text-sm mb-2">
                        {error}
                    </p>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-2"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>
        </div>
    );
}