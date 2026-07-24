import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

import AcademicProgressBar from "../../components/AcademicProgressBar";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";
import { saveAcademicCalendar } from "../../services/academicCalendarService";

import { getWorkflowHealth } from "../../ai/services/workflowHealth";
import { WorkflowHealth } from "../../ai/types";

const inputClass =
    "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all bg-white";

const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { calendar, loading: calLoading } = useAcademicCalendar();

    const [users, setUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);

    const [calForm, setCalForm] = useState({
        proposalStartDate: "",
        proposalDueDate: "",
        reviewDueDate: "",
    });
    const [calSaving, setCalSaving] = useState(false);
    const [calSaved, setCalSaved] = useState(false);
    const [calOpen, setCalOpen] = useState(false);

    const [workflowHealth, setWorkflowHealth] = useState<WorkflowHealth | null>(null);

    useEffect(() => {
        async function loadInsights() {
            const health = await getWorkflowHealth();
            setWorkflowHealth(health);
        }
        loadInsights();
    }, []);

    useEffect(() => {
        if (calendar) {
            setCalForm({
                proposalStartDate: calendar.proposalStartDate,
                proposalDueDate: calendar.proposalDueDate,
                reviewDueDate: calendar.reviewDueDate,
            });
        }
    }, [calendar]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), snap =>
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "proposals"), snap =>
            setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "meetingRequests"), snap =>
            setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => unsub();
    }, []);

    // Derived stats
    const students = users.filter(u => u.role === "student");
    const supervisors = users.filter(u => u.role === "supervisor");
    const approved = proposals.filter(p => p.status === "approved");
    const pending = proposals.filter(p =>
        ["submitted", "resubmitted", "under_review"].includes(p.status)
    );
    const rejected = proposals.filter(p => p.status === "rejected");
    const pendingMeetings = meetings.filter(m => m.status === "pending");
    const scheduledMeetings = meetings.filter(m => m.status === "scheduled");
    const completedMeetings = meetings.filter(m => m.status === "completed");
    const cancelledMeetings = meetings.filter(m => m.status === "cancelled");
    const awaitingLinkMeetings = meetings.filter(m => m.status === "approved_waiting_link");

    const handleSaveCalendar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!calForm.proposalStartDate || !calForm.proposalDueDate || !calForm.reviewDueDate) return;
        setCalSaving(true);
        await saveAcademicCalendar(calForm, user.uid);
        setCalSaving(false);
        setCalSaved(true);
        setCalOpen(false);
        setTimeout(() => setCalSaved(false), 3000);
    };

    const quickActions = [
        { title: "User Management", description: "Students, supervisors & admins", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "from-amber-500 to-yellow-500", path: "/admin/users" },
        { title: "All Proposals", description: "Review & manage research proposals", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "from-blue-500 to-indigo-500", path: "/admin/proposals" },
        { title: "Assign Supervisors", description: "Match students to supervisors", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "from-orange-500 to-amber-500", path: "/admin/assignments" },
        { title: "Meetings", description: "Monitor supervision sessions", icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "from-emerald-500 to-teal-500", path: "/admin/meetings" },
        { title: "Reports", description: "Analytics & academic progress", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "from-violet-500 to-purple-500", path: "/admin/reports" },
        { title: "AI Insights", description: "Workflow intelligence & analysis", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "from-pink-500 to-rose-500", path: "/admin/ai-analytics" },
    ];

    const formatDate = (val: string) => {
        if (!val) return "Not set";
        return new Date(val).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">

                {/* ── HEADER ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">Admin Portal</p>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            Welcome back{profile ? `, ${profile.firstName}` : ""}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            System-wide overview — users, proposals, meetings & workflows.
                        </p>
                    </div>
                    {calSaved && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl animate-pulse">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Calendar saved!
                        </div>
                    )}
                </div>

                {/* ── ACADEMIC PROGRESS BAR ── */}
                {!calLoading && (
                    <AcademicProgressBar calendar={calendar} role="admin" />
                )}

                {/* ── KEY METRICS: 3 grouped panels ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Users panel */}
                    <div
                        onClick={() => navigate("/admin/users")}
                        className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl p-5 text-white shadow-md shadow-amber-500/20 cursor-pointer hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Users</span>
                            <svg className="w-5 h-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-black">{users.length}</p>
                        <p className="text-amber-100 text-xs font-semibold mt-1">Total registered</p>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-amber-400/30 text-xs font-bold">
                            <span>{students.length} Students</span>
                            <span>{supervisors.length} Supervisors</span>
                        </div>
                    </div>

                    {/* Proposals panel */}
                    <div
                        onClick={() => navigate("/admin/proposals")}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 hover:scale-[1.02] active:scale-[0.99] transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Proposals</span>
                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{proposals.length}</p>
                        <p className="text-slate-400 text-xs font-semibold mt-1">All time</p>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 text-xs font-bold flex-wrap">
                            <span className="text-amber-600">{pending.length} Pending</span>
                            <span className="text-emerald-600">{approved.length} Approved</span>
                            <span className="text-rose-500">{rejected.length} Rejected</span>
                        </div>
                    </div>

                    {/* Meetings panel */}
                    <div
                        onClick={() => navigate("/admin/meetings")}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 hover:scale-[1.02] active:scale-[0.99] transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Meetings</span>
                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{meetings.length}</p>
                        <p className="text-slate-400 text-xs font-semibold mt-1">Total requests</p>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 text-xs font-bold flex-wrap">
                            <span className="text-amber-600">{pendingMeetings.length} Pending</span>
                            <span className="text-blue-600">{scheduledMeetings.length} Upcoming</span>
                            <span className="text-emerald-600">{completedMeetings.length} Done</span>
                        </div>
                    </div>
                </div>

                {/* ── SECONDARY STATS: Meetings breakdown ── */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Meeting Breakdown</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Awaiting Link", value: awaitingLinkMeetings.length, color: "text-blue-500" },
                            { label: "Cancelled", value: cancelledMeetings.length, color: "text-rose-500" },
                            { label: "Rescheduled", value: meetings.filter(m => m.status === "rescheduled").length, color: "text-purple-500" },
                            { label: "Declined", value: meetings.filter(m => m.status === "declined").length, color: "text-orange-500" },
                        ].map(item => (
                            <div key={item.label} className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className={`text-2xl font-black mt-1 ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SECONDARY STATS: Proposals breakdown ── */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Proposal Breakdown</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Under Review", value: proposals.filter(p => p.status === "under_review").length, color: "text-blue-500" },
                            { label: "Revision Requested", value: proposals.filter(p => p.status === "revision_requested").length, color: "text-purple-500" },
                            { label: "Submitted", value: proposals.filter(p => p.status === "submitted").length, color: "text-amber-500" },
                            { label: "Resubmitted", value: proposals.filter(p => p.status === "resubmitted").length, color: "text-orange-500" },
                        ].map(item => (
                            <div key={item.label} className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className={`text-2xl font-black mt-1 ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ACADEMIC CALENDAR SETTINGS ── */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {/* Accordion toggle */}
                    <button
                        type="button"
                        onClick={() => setCalOpen(!calOpen)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800 text-sm">Academic Calendar Settings</p>
                                {!calOpen && calendar && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Submissions open <span className="text-slate-600 font-semibold">{formatDate(calendar.proposalStartDate)}</span>
                                        {" — "}due <span className="text-slate-600 font-semibold">{formatDate(calendar.proposalDueDate)}</span>
                                    </p>
                                )}
                                {!calOpen && !calendar && (
                                    <p className="text-xs text-amber-500 font-semibold mt-0.5 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        No calendar configured yet
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={`w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-all ${calOpen ? "bg-slate-100" : ""}`}>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${calOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    {/* Expanded form */}
                    {calOpen && (
                        <form onSubmit={handleSaveCalendar} className="border-t border-slate-100 px-6 py-6 space-y-5">
                            <p className="text-xs text-slate-400 font-medium">
                                Set the academic cycle dates. These dates power the progress bar and deadline tracking across all roles.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Submission Opens
                                        <span className="ml-1 text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={calForm.proposalStartDate}
                                        onChange={e => setCalForm({ ...calForm, proposalStartDate: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                    {calForm.proposalStartDate && (
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(calForm.proposalStartDate)}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Submission Deadline
                                        <span className="ml-1 text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={calForm.proposalDueDate}
                                        onChange={e => setCalForm({ ...calForm, proposalDueDate: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                    {calForm.proposalDueDate && (
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(calForm.proposalDueDate)}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Review Deadline
                                        <span className="ml-1 text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={calForm.reviewDueDate}
                                        onChange={e => setCalForm({ ...calForm, reviewDueDate: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                    {calForm.reviewDueDate && (
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(calForm.reviewDueDate)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={calSaving}
                                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {calSaving ? "Saving…" : "Save Calendar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 font-semibold text-sm transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── QUICK ACTIONS ── */}
                <div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {quickActions.map(action => (
                            <button
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left group cursor-pointer w-full"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{action.title}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{action.description}</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}