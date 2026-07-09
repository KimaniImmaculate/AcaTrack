import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../services/firebase";

export default function Login() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let targetEmail = identifier.trim();

        try {
            // If the identifier is NOT an email (does not contain "@"), search Firestore by admission/staff number
            if (!targetEmail.includes("@")) {
                // Search as admission number (students)
                const studentQuery = query(
                    collection(db, "users"),
                    where("admissionNumber", "==", targetEmail)
                );
                const studentSnap = await getDocs(studentQuery);

                if (!studentSnap.empty) {
                    targetEmail = studentSnap.docs[0].data().email;
                } else {
                    // Search as staff number (supervisors)
                    const supervisorQuery = query(
                        collection(db, "users"),
                        where("staffNumber", "==", targetEmail)
                    );
                    const supervisorSnap = await getDocs(supervisorQuery);

                    if (!supervisorSnap.empty) {
                        targetEmail = supervisorSnap.docs[0].data().email;
                    } else {
                        setError("No account found with this admission number or staff number.");
                        setLoading(false);
                        return;
                    }
                }
            }

            // Authenticate with Firebase using resolved email
            const credential = await signInWithEmailAndPassword(auth, targetEmail, password);

            // Fetch final profile to determine dashboard routing
            const userDoc = await getDoc(doc(db, "users", credential.user.uid));

            if (!userDoc.exists()) {
                setError("User profile not found in database.");
                return;
            }

            const userData = userDoc.data();

            switch (userData.role) {
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
                    setError("Invalid user role mapping.");
            }
        } catch (err: any) {
            console.error("Login authentication error:", err);
            // Translate firebase auth codes into user-friendly error logs
            if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("Invalid login credentials. Please try again.");
            } else {
                setError(err.message || "An unexpected error occurred during login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-4 relative overflow-hidden">
            {/* Background Blur Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl space-y-6 relative z-10">
                {/* Header Logo */}
                <div className="text-center space-y-2">
                    <div 
                        onClick={() => navigate("/")} 
                        className="mx-auto bg-linear-to-tr from-amber-500 to-yellow-600 p-2.5 rounded-2xl text-white shadow-md shadow-amber-500/20 w-fit cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            {/* Graduation Cap Top */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L21 7 L12 11 L3 7 Z" />
                            {/* Cap base */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5 V12.5 C7 14.5, 17 14.5, 17 12.5 V8.5" />
                            {/* Chart track line with arrow */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19 L10 14 L14 16 L19 11 M15 11 H19 V15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight mt-3">
                        Welcome to AcaTrack
                    </h1>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                        Sign In to your account
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Email, Admission, or Staff Number
                        </label>
                        <input
                            type="text"
                            placeholder="Email / Admission No. / Staff No."
                            className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-855 outline-none transition-all placeholder:text-slate-300"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 pr-12 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0013.42 13.42" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.42 10.42 0 0112 5c7 0 10 7 10 7a18.4 18.4 0 01-3.34 4.49" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61C4.02 8.35 2 12 2 12s3 7 10 7c1.42 0 2.74-.25 3.93-.68" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-right text-xs text-slate-400">
                            <Link
                                to="/forgot-password"
                                className="font-bold text-slate-600 hover:text-amber-600 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold p-3.5 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer mt-2"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-amber-600 font-bold hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}