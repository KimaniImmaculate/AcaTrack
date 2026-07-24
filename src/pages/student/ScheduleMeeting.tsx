import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createMeetingRequest } from "../../services/meetingService";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import DashboardLayout from "../../layouts/DashboardLayout";
import FormAlert from "../../components/FormAlert";

const inputClass = "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 bg-white";
const selectClass = "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 bg-white appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat cursor-pointer";
const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function ScheduleMeeting() {
    const { proposalId } = useParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        agenda: "",
        date: "",
        time: "",
        duration: "1 hour",
        mode: "online",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submitRequest = async () => {
        if (!user || !profile || !proposalId) return;
        setLoading(true);
        setError("");

        try {
            const proposalSnap = await getDoc(doc(db, "proposals", proposalId));
            if (!proposalSnap.exists()) {
                setError("Proposal not found.");
                return;
            }
            const proposal = proposalSnap.data();

            await createMeetingRequest(
                {
                    studentId: user.uid,
                    supervisorId: proposal.supervisorId,
                    proposalId,
                    title: form.title,
                    agenda: form.agenda,
                    requestedDate: form.date,
                    requestedTime: form.time,
                    duration: form.duration,
                    mode: form.mode as "online" | "physical",
                    status: "pending",
                },
                `${profile.firstName} ${profile.lastName}`
            );

            navigate(`/student/proposals/${proposalId}`);
        } catch (err) {
            console.error("Meeting request error:", err);
            setError("Failed to send meeting request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Schedule a Meeting</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Submit a meeting request to your supervisor.
                    </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                        Meeting Details
                    </h2>

                    {/* Title */}
                    <div>
                        <label className={labelClass}>Meeting Title <span className="text-rose-400">*</span></label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Proposal Review Session"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Agenda */}
                    <div>
                        <label className={labelClass}>Agenda <span className="text-rose-400">*</span></label>
                        <textarea
                            className={`${inputClass} resize-none`}
                            rows={3}
                            placeholder="What topics do you want to discuss?"
                            value={form.agenda}
                            onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Preferred Date <span className="text-rose-400">*</span></label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Preferred Time <span className="text-rose-400">*</span></label>
                            <input
                                type="time"
                                className={inputClass}
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Duration & Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Duration</label>
                            <select
                                className={selectClass}
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            >
                                <option value="30 minutes">30 minutes</option>
                                <option value="1 hour">1 hour</option>
                                <option value="1.5 hours">1.5 hours</option>
                                <option value="2 hours">2 hours</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Mode</label>
                            <select
                                className={selectClass}
                                value={form.mode}
                                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                            >
                                <option value="online">Online</option>
                                <option value="physical">Physical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error */}
                <FormAlert message={error} />

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={submitRequest}
                        disabled={loading || !form.title || !form.date || !form.time}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
                    >
                        {loading ? "Sending Request…" : "Send Meeting Request"}
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