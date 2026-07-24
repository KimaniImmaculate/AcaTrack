import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { createNotification } from "../../services/notifications";
import DashboardLayout from "../../layouts/DashboardLayout";
import FormAlert from "../../components/FormAlert";

export default function AddMeetingLink() {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const submitLink = async () => {
        if (!meetingId || !link.trim()) return;
        setLoading(true);
        setError("");

        try {
            const meetingRef = doc(db, "meetingRequests", meetingId);
            const snap = await getDoc(meetingRef);
            if (!snap.exists()) {
                setError("Meeting not found.");
                return;
            }
            const meeting = snap.data();

            await updateDoc(meetingRef, {
                meetingLink: link.trim(),
                status: "scheduled",
                updatedAt: serverTimestamp(),
            });

            await createNotification(
                meeting.supervisorId,
                meeting.proposalId,
                "Meeting Link Added",
                "The student has added the meeting link",
                "meeting_link_added"
            );

            setSuccess(true);
            setTimeout(() => navigate(-1), 1500);
        } catch (err) {
            console.error(err);
            setError("Failed to save meeting link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Add Meeting Link</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Paste the video call link so your supervisor can join.
                    </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                        Meeting Link
                    </h2>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Google Meet / Zoom / Teams URL <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                </svg>
                            </div>
                            <input
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl pl-9 pr-3 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                            Supports Google Meet, Zoom, Teams, or any video call platform.
                        </p>
                    </div>
                </div>

                {/* Success */}
                {success && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-emerald-700">Meeting link saved! Redirecting…</p>
                    </div>
                )}

                {/* Error */}
                <FormAlert message={error} />

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={submitLink}
                        disabled={loading || !link.trim() || success}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
                    >
                        {loading ? "Saving…" : "Save Meeting Link"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 font-semibold text-sm transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}