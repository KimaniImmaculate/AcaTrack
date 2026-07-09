import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import AcademicProgressBar from "../../components/AcademicProgressBar";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";
import { saveAcademicCalendar } from "../../services/academicCalendarService";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { calendar, loading: calLoading } = useAcademicCalendar();

    const [users,     setUsers]     = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);

    // Calendar form state
    const [calForm, setCalForm] = useState({
        proposalStartDate: "",
        proposalDueDate:   "",
        reviewDueDate:     "",
    });
    const [calSaving, setCalSaving] = useState(false);
    const [calSaved,  setCalSaved]  = useState(false);
    const [calOpen,   setCalOpen]   = useState(false);

    // Populate form from Firestore whenever calendar loads/changes
    useEffect(() => {
        if (calendar) {
            setCalForm({
                proposalStartDate: calendar.proposalStartDate,
                proposalDueDate:   calendar.proposalDueDate,
                reviewDueDate:     calendar.reviewDueDate,
            });
        }
    }, [calendar]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "proposals"), (snapshot) => {
            setProposals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const students    = users.filter(u => u.role === "student");
    const supervisors = users.filter(u => u.role === "supervisor");
    const approved    = proposals.filter(p => p.status === "approved");
    const pending     = proposals.filter(p =>
        p.status === "submitted" || p.status === "resubmitted" || p.status === "under_review"
    );

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
        {
            title: "User Management",
            description: "View and manage students, supervisors and administrators.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            gradient: "from-amber-500 to-yellow-500",
            path: "/admin/users",
            label: "Manage Users",
        },
        {
            title: "Proposal Management",
            description: "Review all research proposals submitted in the system.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            gradient: "from-amber-600 to-amber-500",
            path: "/admin/proposals",
            label: "View Proposals",
        },
        {
            title: "Supervisor Assignment",
            description: "Assign students to available supervisors quickly.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            gradient: "from-amber-500 to-orange-500",
            path: "/admin/assignments",
            label: "Assign Supervisors",
        },
        {
            title: "Reports & Analytics",
            description: "View academic progress reports and system analytics.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            gradient: "from-emerald-500 to-green-600",
            path: "/admin/reports",
            label: "View Reports",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            System-wide overview — manage users, proposals and academic workflows.
                        </p>
                    </div>
                    {calSaved && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Calendar saved!
                        </div>
                    )}
                </div>

                {/* Academic Calendar Progress */}
                {!calLoading && (
                    <AcademicProgressBar calendar={calendar} role="admin" />
                )}

                {/* Calendar Settings Panel */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setCalOpen(o => !o)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Academic Calendar Settings</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {calendar
                                        ? `Submission deadline: ${new Date(calendar.proposalDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                                        : "Set proposal start, due and review dates"}
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${calOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {calOpen && (
                        <form onSubmit={handleSaveCalendar} className="border-t border-slate-100 p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Proposal Start Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={calForm.proposalStartDate}
                                        onChange={e => setCalForm(f => ({ ...f, proposalStartDate: e.target.value }))}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-700 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Submission Deadline
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={calForm.proposalDueDate}
                                        onChange={e => setCalForm(f => ({ ...f, proposalDueDate: e.target.value }))}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-700 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Review Period End
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={calForm.reviewDueDate}
                                        onChange={e => setCalForm(f => ({ ...f, reviewDueDate: e.target.value }))}
                                        className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-700 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={calSaving}
                                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    {calSaving ? "Saving…" : "Save Calendar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalOpen(false)}
                                    className="text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        {
                            label: "Total Users", value: users.length, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                </svg>
                            ), gradient: "from-amber-500 to-yellow-500"
                        },
                        {
                            label: "Students", value: students.length, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            ), gradient: "from-amber-600 to-amber-500"
                        },
                        {
                            label: "Supervisors", value: supervisors.length, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            ), gradient: "from-amber-500 to-orange-500"
                        },
                        {
                            label: "Total Proposals", value: proposals.length, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            ), gradient: "from-emerald-500 to-green-600"
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-850 leading-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats row */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Reviews</p>
                        <p className="text-3xl font-black text-amber-500">{pending.length}</p>
                        <p className="text-xs text-slate-400 font-medium">proposals awaiting action</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved Proposals</p>
                        <p className="text-3xl font-black text-emerald-500">{approved.length}</p>
                        <p className="text-xs text-slate-400 font-medium">successfully approved</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-sm font-bold text-slate-700 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {quickActions.map((action) => (
                            <div
                                key={action.path}
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-md mb-4`}>
                                    {action.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm">{action.title}</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{action.description}</p>
                                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
                                    {action.label}
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}