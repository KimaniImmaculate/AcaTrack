import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { completeMeeting } from "../../services/meetingService";
import DashboardLayout from "../../layouts/DashboardLayout";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending:               { label: "Pending",       color: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
    approved_waiting_link: { label: "Awaiting Link", color: "bg-blue-100 text-blue-700",       dot: "bg-blue-400" },
    scheduled:             { label: "Upcoming",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
    completed:             { label: "Completed",     color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
    cancelled:             { label: "Cancelled",     color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    declined:              { label: "Declined",      color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    rescheduled:           { label: "Reschedule Proposed", color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
};

export default function SupervisorMyMeetings() {
    const { user, profile } = useAuth();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"scheduled" | "completed" | "cancelled">("scheduled");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;
        const statuses = activeTab === "scheduled"
            ? ["scheduled", "pending", "approved_waiting_link", "rescheduled"]
            : activeTab === "completed"
                ? ["completed"]
                : ["cancelled", "declined"];

        const q = query(
            collection(db, "meetingRequests"),
            where("supervisorId", "==", user.uid),
            where("status", "in", statuses)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [user, activeTab]);

    const tabs = [
        { key: "scheduled", label: "Upcoming", activeClass: "bg-emerald-500 text-white" },
        { key: "completed", label: "Completed", activeClass: "bg-slate-700 text-white" },
        { key: "cancelled", label: "Cancelled", activeClass: "bg-rose-600 text-white" },
    ] as const;

    const filtered = search.trim()
        ? meetings.filter(m => {
            const q = search.toLowerCase();
            return (
                (m.title || "").toLowerCase().includes(q) ||
                (m.studentName || "").toLowerCase().includes(q) ||
                (m.agenda || "").toLowerCase().includes(q) ||
                (m.mode || "").toLowerCase().includes(q)
            );
          })
        : meetings;

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Meetings</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Your scheduled supervision sessions.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === tab.key ? tab.activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                        placeholder="Search by student, title, agenda or mode…"
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
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-500 text-sm">No {activeTab} meetings</p>
                    </div>
                )}

                {/* Cards */}
                <div className="space-y-4">
                    {filtered.map(meeting => {
                        const s = STATUS_CONFIG[meeting.status] ?? { label: meeting.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                        return (
                            <div key={meeting.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-300" />
                                <div className="p-6 space-y-4">

                                    {/* Top Row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-base truncate">{meeting.title}</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Student: <span className="font-semibold text-slate-600">{meeting.studentName || "—"}</span>
                                            </p>
                                        </div>
                                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Agenda */}
                                    {meeting.agenda && (
                                        <div className="bg-slate-50 rounded-xl px-4 py-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agenda</p>
                                            <p className="text-sm text-slate-600">{meeting.agenda}</p>
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{meeting.requestedDate || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{meeting.requestedTime || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{meeting.duration || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{meeting.mode || "—"}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 flex-wrap">
                                        {meeting.status === "scheduled" && meeting.meetingLink && (
                                            <a
                                                href={meeting.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                                Join Meeting
                                            </a>
                                        )}
                                        {meeting.status === "scheduled" && (
                                            <button
                                                onClick={() => completeMeeting(meeting.id, meeting, `${profile?.firstName} ${profile?.lastName}`)}
                                                className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>

                                    {/* Proposed Reschedule Info */}
                                    {meeting.status === "rescheduled" && (
                                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-1">
                                            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">You Proposed Reschedule</p>
                                            <div className="flex gap-4 text-sm text-purple-900 font-semibold">
                                                <span>Proposed Date: {meeting.rescheduleDate}</span>
                                                <span>Proposed Time: {meeting.rescheduleTime}</span>
                                            </div>
                                            {meeting.rescheduleReason && (
                                                <p className="text-xs text-purple-700 italic">
                                                    "{meeting.rescheduleReason}"
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Cancellation / Decline Reason */}
                                    {(meeting.status === "cancelled" || meeting.status === "declined") && (meeting.cancelReason || meeting.declineReason) && (
                                        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                                            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-0.5">Decline/Cancellation Reason</p>
                                            <p className="text-sm text-rose-700">{meeting.cancelReason || meeting.declineReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}