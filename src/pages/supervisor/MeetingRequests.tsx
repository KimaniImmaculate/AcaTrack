import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { acceptMeetingRequest, declineMeetingRequest, rescheduleMeetingRequest } from "../../services/meetingService";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function MeetingRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "meetingRequests"),
            where("supervisorId", "==", user.uid),
            where("status", "==", "pending")
        );
        const unsubscribe = onSnapshot(q, snapshot => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Meeting Requests</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Review and respond to pending meeting requests from your students.
                    </p>
                </div>

                {/* Empty State */}
                {requests.length === 0 && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-600 text-sm">No pending requests</p>
                        <p className="text-xs text-slate-400 mt-1">When students send meeting requests, they'll appear here.</p>
                    </div>
                )}

                {/* Request Cards */}
                <div className="space-y-4">
                    {requests.map(request => (
                        <MeetingCard key={request.id} request={request} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

function MeetingCard({ request }: { request: any }) {
    const { profile } = useAuth();
    const [showDecline, setShowDecline] = useState(false);
    const [showReschedule, setShowReschedule] = useState(false);
    const [reason, setReason] = useState("");
    const [rescheduleDate, setRescheduleDate] = useState(request.requestedDate || "");
    const [rescheduleTime, setRescheduleTime] = useState(request.requestedTime || "");
    const [rescheduleReason, setRescheduleReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [declined, setDeclined] = useState(false);

    const supervisorName = `${profile?.firstName || ""} ${profile?.lastName || ""}`;

    const handleAccept = async () => {
        setLoading(true);
        try {
            await acceptMeetingRequest(request.id, request, supervisorName);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        setLoading(true);
        try {
            await declineMeetingRequest(request.id, request, reason, supervisorName);
            setDeclined(true);
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = async () => {
        setLoading(true);
        try {
            await rescheduleMeetingRequest(
                request.id,
                request,
                rescheduleDate,
                rescheduleTime,
                rescheduleReason,
                supervisorName
            );
            setDeclined(true);
        } finally {
            setLoading(false);
        }
    };

    if (declined) return null;

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />

            <div className="p-6 space-y-5">
                {/* Title + Student */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">{request.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Requested by <span className="font-semibold text-slate-600">{request.studentName || "Student"}</span>
                        </p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                    </span>
                </div>

                {/* Agenda */}
                {request.agenda && (
                    <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agenda</p>
                        <p className="text-sm text-slate-600">{request.agenda}</p>
                    </div>
                )}

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{request.requestedDate || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{request.requestedTime || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{request.duration || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{request.mode || "—"}</p>
                    </div>
                </div>

                {/* Actions */}
                {!showDecline && !showReschedule ? (
                    <div className="flex gap-2 pt-1 flex-wrap sm:flex-nowrap">
                        <button
                            disabled={loading}
                            onClick={handleAccept}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {loading ? "Accepting…" : "Accept"}
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => setShowReschedule(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-amber-200 text-amber-600 hover:bg-amber-50 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reschedule
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => setShowDecline(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline
                        </button>
                    </div>
                ) : showDecline ? (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Reason for Declining (Student will see this)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Briefly explain why you're declining this request…"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleDecline}
                                disabled={loading || !reason.trim()}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Declining…" : "Confirm Decline"}
                            </button>
                            <button
                                onClick={() => { setShowDecline(false); setReason(""); }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 font-semibold text-sm transition-all cursor-pointer"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 text-sm">Reschedule Meeting</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Proposed Date
                                </label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={e => setRescheduleDate(e.target.value)}
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-2.5 text-sm text-slate-800 outline-none bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Proposed Time
                                </label>
                                <input
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={e => setRescheduleTime(e.target.value)}
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-2.5 text-sm text-slate-800 outline-none bg-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Comments / Notes (e.g., reason or location info)
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Explain why or suggest details for the rescheduling…"
                                value={rescheduleReason}
                                onChange={e => setRescheduleReason(e.target.value)}
                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReschedule}
                                disabled={loading || !rescheduleDate || !rescheduleTime}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Proposing Reschedule…" : "Confirm Reschedule"}
                            </button>
                            <button
                                onClick={() => { setShowReschedule(false); }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 font-semibold text-sm transition-all cursor-pointer"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}