import { useState } from "react";

import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    doc,
    setDoc
} from "firebase/firestore";

import {
    auth,
    db
} from "../../services/firebase";

import {
    useNavigate,
    Link
} from "react-router-dom";

import FormAlert from "../../components/FormAlert";


export default function Register() {

    const navigate = useNavigate();


    const [
        firstName,
        setFirstName
    ] = useState("");


    const [
        lastName,
        setLastName
    ] = useState("");


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        showPassword,
        setShowPassword
    ] = useState(false);



    const [
        role,
        setRole
    ] = useState<
        "student" | "supervisor"
    >("student");



    const [prefix,          setPrefix]          = useState("");
    const [department,      setDepartment]      = useState("");
    const [school,          setSchool]          = useState("");
    const [admissionNumber, setAdmissionNumber] = useState("");
    const [staffNumber,     setStaffNumber]     = useState("");



    const [
        loading,
        setLoading
    ] = useState(false);



    const [
        error,
        setError
    ] = useState("");




    const handleRegister = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setError("");

        // Custom validation — styled errors instead of browser tooltip
        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name.");
            return;
        }
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!password) {
            setError("Please enter a password.");
            return;
        }
        if (role === "student" && !admissionNumber.trim()) {
            setError("Please enter your admission number.");
            return;
        }
        if (role === "supervisor" && !staffNumber.trim()) {
            setError("Please enter your staff number.");
            return;
        }

        setLoading(true);



        try {


            if (role === "student") {

                const admissionRegex =
                    /^[A-Z]{3}\/\d{3}\/\d{2}$/;


                if (
                    !admissionRegex.test(
                        admissionNumber
                    )
                ) {

                    throw new Error(
                        "Admission number must be ABC/123/26"
                    );

                }

            }



            if (role === "supervisor") {

                const staffRegex =
                    /^[A-Z]{3}\d{5}$/;


                if (
                    !staffRegex.test(
                        staffNumber
                    )
                ) {

                    throw new Error(
                        "Staff number must be XYZ09887"
                    );

                }

            }



            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;



            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {


                    id: user.uid,


                    firstName,


                    lastName,


                    email: user.email,


                    role,


                    department,
                    school,



                    ...(role === "student" && {

                        admissionNumber

                    }),



                    ...(role === "supervisor" && {
                        staffNumber,
                        ...(prefix && { prefix }),
                    }),



                    createdAt:
                        new Date()

                }

            );



            navigate("/login");



        } catch (err: any) {

            setError(
                err.message
            );


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
                        Create Account
                    </h1>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                        Register to submit or review research
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 pt-2">

                    {/* Role selector — shown first so prefix field can respond */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                I am a...
                            </label>
                            <select
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 bg-white outline-none transition-all"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "student" | "supervisor")}
                            >
                                <option value="student">Student</option>
                                <option value="supervisor">Supervisor / Lecturer</option>
                            </select>
                        </div>

                        {/* Prefix — supervisors only */}
                        {role === "supervisor" && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Title / Prefix
                                </label>
                                <select
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 bg-white outline-none transition-all"
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                >
                                    <option value="">— Select prefix —</option>
                                    <option value="Dr.">Dr.</option>
                                    <option value="Prof.">Prof.</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Mrs.">Mrs.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Eng.">Eng.</option>
                                    <option value="Rev.">Rev.</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                First Name
                            </label>
                            <input
                                placeholder="John"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Last Name
                            </label>
                            <input
                                placeholder="Doe"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="name@university.edu"
                            className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 pr-12 text-sm text-slate-855 outline-none transition-all placeholder:text-slate-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    </div>

                    {/* School + Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                School
                            </label>
                            <input
                                placeholder="e.g. School of Science"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Department
                            </label>
                            <input
                                placeholder="e.g. Department of Computer Science"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-855 outline-none transition-all placeholder:text-slate-300"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>
                    </div>

                    {role === "student" && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Admission Number
                            </label>
                            <input
                                placeholder="ABC/123/26"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                            />
                        </div>
                    )}

                    {role === "supervisor" && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Staff Number
                            </label>
                            <input
                                placeholder="XYZ09887"
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                value={staffNumber}
                                onChange={(e) => setStaffNumber(e.target.value)}
                            />
                        </div>
                    )}

                    <FormAlert message={error} />

                    <button
                        disabled={loading}
                        className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer mt-2"
                    >
                        {loading ? "Registering…" : "Create Account"}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-amber-600 font-bold hover:underline"
                        >
                            Log In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );

}