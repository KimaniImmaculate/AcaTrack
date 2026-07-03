import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Create auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // 2. Create Firestore user profile
            await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                firstName,
                lastName,
                email: user.email,
                role: "student",
                createdAt: new Date()
            });

            navigate("/login");

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
                <h1 className="text-xl font-bold mb-4">
                    Register
                </h1>

                {/* FIRST NAME */}
                <input
                    type="text"
                    placeholder="First Name"
                    className="w-full border p-2 mb-3"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                {/* LAST NAME */}
                <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full border p-2 mb-3"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                {/* EMAIL */}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* PASSWORD */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* ERROR */}
                {error && (
                    <p className="text-red-500 text-sm mb-2">
                        {error}
                    </p>
                )}

                {/* SUBMIT */}
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