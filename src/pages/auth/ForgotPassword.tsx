import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../../services/firebase";
import FormAlert from "../../components/FormAlert";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const email = identifier.trim();
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(`Reset link sent to ${email}. Check your inbox and spam folder.`);
        } catch (err: any) {
            setError(err.message || "Unable to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl space-y-6 relative z-10">
                <div className="text-center space-y-2">
                    <div
                        onClick={() => navigate("/")}
                        className="mx-auto bg-linear-to-tr from-amber-500 to-yellow-600 p-2.5 rounded-2xl text-white shadow-md shadow-amber-500/20 w-fit cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L21 7 L12 11 L3 7 Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5 V12.5 C7 14.5, 17 14.5, 17 12.5 V8.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19 L10 14 L14 16 L19 11 M15 11 H19 V15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight mt-3">
                        Reset Your Password
                    </h1>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                        We’ll send you a password reset link
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="name@university.edu"
                            className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <FormAlert message={error} />
                    <FormAlert message={success} variant="success" />

                    <button
                        disabled={loading}
                        className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer mt-2"
                    >
                        {loading ? "Sending reset link..." : "Send Reset Link"}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Remembered it?{" "}
                        <Link
                            to="/login"
                            className="text-amber-600 font-bold hover:underline"
                        >
                            Back to Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}