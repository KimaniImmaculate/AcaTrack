import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { acceptRescheduledMeeting, declineMeetingRequest } from "../../services/meetingService";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function MyMeetings() {
    const { user, profile } = useAuth();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "meetingRequests"), where("studentId", "==", user.uid));
        const unsub = onSnapshot(q, (snapshot) => {
            setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [user]);

    const studentName = profile ? `${profile.firstName} ${profile.lastName}` : "Student";

    const filtered = search.trim()
        ? meetings.filter(m => {
            const q = search.toLowerCase();
            return (
                (m.title || "").toLowerCase().includes(q) ||
                (m.agenda || "").toLowerCase().includes(q) ||
                (m.mode || "").toLowerCase().includes(q)
            );
          })
        : meetings;

    const handleAcceptReschedule = async (meeting: any) => {
        try {
            await acceptRescheduledMeeting(meeting.id, meeting, studentName);
        } catch (error) {
            console.error("Error accepting reschedule:", error);
        }
    };

    const handleDeclineReschedule = async (meeting: any) => {
        const reason = prompt("Enter a reason for declining this proposed reschedule (optional):") || "";
        try {
            await declineMeetingRequest(meeting.id, meeting, reason, studentName);
        } catch (error) {
            console.error("Error declining reschedule:", error);
        }
    };

    const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
        pending:               { label: "Pending",         color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
        approved_waiting_link: { label: "Awaiting Link",   color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400" },
        scheduled:             { label: "Upcoming",        color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
        completed:             { label: "Completed",       color: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
        cancelled:             { label: "Cancelled",       color: "bg-rose-100 text-rose-700",     dot: "bg-rose-400" },
        declined:              { label: "Declined",        color: "bg-rose-100 text-rose-700",     dot: "bg-rose-400" },
        rescheduled:           { label: "Reschedule Proposed", color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Meetings</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">All your supervision meeting requests and sessions.</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title or agenda…"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {meetings.length === 0 && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-600 text-sm">No meetings yet</p>
                        <p className="text-xs text-slate-400 mt-1">Your scheduled meetings will appear here.</p>
                    </div>
                )}

                {/* Meeting Cards */}
                <div className="space-y-4">
                    {filtered.map(meeting => {
                        const s = statusConfig[meeting.status] ?? { label: meeting.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                        return (
                            <div key={meeting.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">

                                {/* Top Row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-base truncate">{meeting.title}</h3>
                                        {meeting.agenda && (
                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{meeting.agenda}</p>
                                        )}
                                    </div>
                                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </span>
                                </div>

                                {/* Meta Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <MetaItem icon={
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                                    } label="Date" value={meeting.requestedDate || "—"} />
                                    <MetaItem icon={
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    } label="Time" value={meeting.requestedTime || "—"} />
                                    <MetaItem icon={
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                    } label="Duration" value={meeting.duration || "—"} />
                                    <MetaItem icon={
                                        <path strokeLinecap="round" strokeLinejoin="round" d={meeting.mode === "online"
                                            ? "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
                                            : "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                                        } />
                                    } label="Mode" value={meeting.mode === "online" ? "Online" : "Physical"} />
                                </div>

                                {/* Proposed Reschedule Info */}
                                {meeting.status === "rescheduled" && (
                                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Proposed Reschedule</p>
                                            <div className="flex gap-4 text-sm text-purple-900 font-semibold">
                                                <span>Date: {meeting.rescheduleDate}</span>
                                                <span>Time: {meeting.rescheduleTime}</span>
                                            </div>
                                            {meeting.rescheduleReason && (
                                                <p className="text-xs text-purple-700 mt-1.5 italic">
                                                    "{meeting.rescheduleReason}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAcceptReschedule(meeting)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                                            >
                                                Accept Proposal
                                            </button>
                                            <button
                                                onClick={() => handleDeclineReschedule(meeting)}
                                                className="border border-purple-200 text-purple-600 hover:bg-purple-100/50 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                                            >
                                                Decline / Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Join Button */}
                                {meeting.status === "scheduled" && meeting.meetingLink && (
                                    <a
                                        href={meeting.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                        Join Meeting
                                    </a>
                                )}

                                {/* Cancellation / Decline Reason */}
                                {(meeting.status === "cancelled" || meeting.status === "declined") && (meeting.cancelReason || meeting.declineReason) && (
                                    <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                                        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-0.5">Decline/Cancellation Reason</p>
                                        <p className="text-sm text-rose-700">{meeting.cancelReason || meeting.declineReason}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {icon}
                </svg>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{value}</p>
            </div>
        </div>
    );
}