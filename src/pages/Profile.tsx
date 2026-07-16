import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { uploadProfilePhoto } from "../services/storageService";

export default function Profile() {
    const { user, profile, loading } = useAuth();

    const [prefix, setPrefix] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [school, setSchool] = useState("");
    const [department, setDepartment] = useState("");
    const [admissionNumber, setAdmissionNumber] = useState("");
    const [staffNumber, setStaffNumber] = useState("");

    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Sync state with profile data
    useEffect(() => {
        if (profile) {
            setPrefix(profile.prefix || "");
            setFirstName(profile.firstName || "");
            setLastName(profile.lastName || "");
            setSchool(profile.school || "");
            setDepartment(profile.department || "");
            setAdmissionNumber(profile.admissionNumber || "");
            setStaffNumber(profile.staffNumber || "");
        }
    }, [profile]);

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setStatusMessage(null);

        try {
            const userRef = doc(db, "users", user.uid);
            const updates: any = {
                firstName,
                lastName,
                school,
                department,
            };

            if (profile?.role === "student") {
                updates.admissionNumber = admissionNumber;
            } else if (profile?.role === "supervisor") {
                updates.staffNumber = staffNumber;
                updates.prefix = prefix;
            }

            await updateDoc(userRef, updates);
            setStatusMessage({ text: "Profile details updated successfully!", type: "success" });
        } catch (error) {
            console.error("Error saving profile details:", error);
            setStatusMessage({ text: "Failed to update profile details. Please try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingPhoto(true);
        setStatusMessage(null);

        try {
            const photoURL = await uploadProfilePhoto(user.uid, file);
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { photoURL });
            setStatusMessage({ text: "Profile picture uploaded successfully!", type: "success" });
        } catch (error) {
            console.error("Error uploading profile photo:", error);
            setStatusMessage({ text: "Failed to upload profile picture.", type: "error" });
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading || !profile) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold animate-pulse">
                    Loading profile...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">My Profile</h1>
                    <p className="text-slate-400 text-sm font-semibold mt-1">
                        Manage your account settings, academic units and profile picture
                    </p>
                </div>

                {statusMessage && (
                    <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
                        statusMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                            : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}>
                        {statusMessage.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Left Panel: Profile Photo */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                            {profile.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-slate-350 text-3xl font-black uppercase">
                                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                                </div>
                            )}

                            <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 cursor-pointer flex flex-col items-center justify-center text-white text-[10px] font-bold tracking-wider transition-opacity duration-200">
                                <svg className="w-5 h-5 mb-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Change Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    disabled={uploadingPhoto}
                                />
                            </label>
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {profile.prefix ? `${profile.prefix} ` : ""}{profile.firstName} {profile.lastName}
                            </h3>
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                                {profile.role}
                            </span>
                        </div>

                        {uploadingPhoto && (
                            <p className="text-[10px] text-slate-400 font-bold tracking-wider animate-pulse uppercase">
                                Uploading photo...
                            </p>
                        )}
                    </div>

                    {/* Right Panel: Details Form */}
                    <form onSubmit={handleSaveDetails} className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-1">
                            Personal Information
                        </h3>

                        {/* Read-Only Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                                <span className="text-slate-600 font-semibold">{profile.email}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Role</span>
                                <span className="text-slate-600 font-semibold capitalize">{profile.role}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-4" />

                        {/* Editable Form Fields */}
                        <div className="space-y-4">
                            {profile.role === "supervisor" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title / Prefix</label>
                                    <select
                                        value={prefix}
                                        onChange={(e) => setPrefix(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all bg-white cursor-pointer appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">School</label>
                                    <input
                                        type="text"
                                        value={school}
                                        onChange={(e) => setSchool(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-350"
                                        placeholder="e.g. School of Engineering"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-350"
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                            </div>

                            {profile.role === "student" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Admission Number</label>
                                    <input
                                        type="text"
                                        value={admissionNumber}
                                        onChange={(e) => setAdmissionNumber(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="e.g. S13/12345/18"
                                    />
                                </div>
                            )}

                            {profile.role === "supervisor" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Staff Number</label>
                                    <input
                                        type="text"
                                        value={staffNumber}
                                        onChange={(e) => setStaffNumber(e.target.value)}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="e.g. EMP4567"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs p-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                        >
                            {saving ? "Saving Changes..." : "Save Details"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
