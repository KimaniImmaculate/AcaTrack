import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { completeMeeting, acceptRescheduledMeeting, declineMeetingRequest } from "../../services/meetingService";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending:               { label: "Pending",       color: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
    approved_waiting_link: { label: "Awaiting Link", color: "bg-blue-100 text-blue-700",       dot: "bg-blue-400" },
    scheduled:             { label: "Upcoming",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
    completed:             { label: "Completed",     color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
    cancelled:             { label: "Cancelled",     color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    declined:              { label: "Declined",      color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    rescheduled:           { label: "Reschedule Proposed", color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
};

type TabKey = "scheduled" | "completed" | "cancelled";

export default function Meetings() {
    const { user, role, profile } = useAuth();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [names, setNames] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<TabKey>("scheduled");

    useEffect(() => {
        if (!user || !role) return;

        const statuses = activeTab === "scheduled"
            ? ["scheduled", "pending", "approved_waiting_link", "rescheduled"]
            : activeTab === "completed"
                ? ["completed"]
                : ["cancelled", "declined"];

        let q;
        if (role === "admin") {
            q = query(collection(db, "meetingRequests"), where("status", "in", statuses));
        } else {
            const field = role === "student" ? "studentId" : "supervisorId";
            q = query(
                collection(db, "meetingRequests"),
                where(field, "==", user.uid),
                where("status", "in", statuses)
            );
        }

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
            setMeetings(data);

            // Load participant names
            for (const meeting of data) {
                for (const id of [meeting.studentId, meeting.supervisorId]) {
                    if (!id || names[id]) continue;
                    const userSnap = await getDoc(doc(db, "users", id));
                    if (userSnap.exists()) {
                        const u = userSnap.data();
                        setNames(prev => ({ ...prev, [id]: `${u.prefix ? `${u.prefix} ` : ""}${u.firstName} ${u.lastName}` }));
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [user, role, activeTab]);

    const studentName = profile ? `${profile.firstName} ${profile.lastName}` : "Student";

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

    const handleComplete = async (meeting: any) => {
        const remarks = prompt("Enter remarks or notes about this meeting for the student (optional):") || "";
        try {
            await completeMeeting(meeting.id, meeting, `${profile?.prefix ? `${profile.prefix} ` : ""}${profile?.firstName} ${profile?.lastName}`, remarks);
        } catch (error) {
            console.error("Error completing meeting:", error);
        }
    };

    const tabs: { key: TabKey; label: string; activeClass: string }[] = [
        { key: "scheduled", label: "Upcoming",  activeClass: "bg-amber-500 text-white" },
        { key: "completed", label: "Completed", activeClass: "bg-emerald-600 text-white" },
        { key: "cancelled", label: "Cancelled", activeClass: "bg-rose-600 text-white" },
    ];

    const emptyMessages: Record<TabKey, string> = {
        scheduled: "No upcoming meetings.",
        completed: "No completed meetings.",
        cancelled: "No cancelled meetings.",
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Meetings</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Manage your supervision sessions.</p>
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

                {/* Empty State */}
                {meetings.length === 0 && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-500 text-sm">{emptyMessages[activeTab]}</p>
                    </div>
                )}

                {/* Meeting Cards */}
                <div className="grid gap-5">
                    {meetings.map(meeting => {
                        const s = STATUS_CONFIG[meeting.status] ?? { label: meeting.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                        return (
                            <div key={meeting.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                                <div className={`h-1 ${activeTab === "completed" ? "bg-gradient-to-r from-emerald-400 to-teal-300" : activeTab === "cancelled" ? "bg-gradient-to-r from-rose-400 to-pink-300" : "bg-gradient-to-r from-amber-400 to-yellow-300"}`} />

                                <div className="p-6 space-y-5">

                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="font-bold text-slate-800 text-lg truncate">{meeting.title}</h2>
                                            {meeting.agenda && (
                                                <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{meeting.agenda}</p>
                                            )}
                                        </div>
                                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Participants */}
                                    <div className="flex flex-wrap gap-3">
                                        {(role === "supervisor" || role === "admin") && (
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</p>
                                                    <p className="text-xs font-semibold text-slate-700">{names[meeting.studentId] || "Loading…"}</p>
                                                </div>
                                            </div>
                                        )}
                                        {(role === "student" || role === "admin") && (
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisor</p>
                                                    <p className="text-xs font-semibold text-slate-700">{names[meeting.supervisorId] || "Loading…"}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Meta Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4">
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
                                            {role === "student" && (
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
                                            )}
                                        </div>
                                    )}

                                    {/* Cancellation / Decline reason */}
                                    {(meeting.status === "cancelled" || meeting.status === "declined") && (meeting.cancelReason || meeting.declineReason) && (
                                        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                                            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-0.5">Decline/Cancellation Reason</p>
                                            <p className="text-sm text-rose-700">{meeting.cancelReason || meeting.declineReason}</p>
                                        </div>
                                    )}

                                    {/* Completion Remarks */}
                                    {meeting.status === "completed" && meeting.remarks && (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Supervisor remarks</p>
                                            <p className="text-sm text-emerald-800 font-medium">"{meeting.remarks}"</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
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
                                        {role === "supervisor" && activeTab === "scheduled" && meeting.status === "scheduled" && (
                                            <button
                                                onClick={() => handleComplete(meeting)}
                                                className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}