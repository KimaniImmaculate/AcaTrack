import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import AcademicProgressBar from "../../components/AcademicProgressBar";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";

export default function SupervisorDashboard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { calendar } = useAcademicCalendar();
    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "proposals"),
            where("supervisorId", "==", user.uid)
        );

        const unsub = onSnapshot(q, (snap) => {
            setProposals(
                snap.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Proposal, "id">),
                }))
            );
        });

        return () => unsub();
    }, [user]);

    const stats = {
        total: proposals.length,
        submitted: proposals.filter(p => p.status === "submitted" || p.status === "resubmitted").length,
        underReview: proposals.filter(p => p.status === "under_review").length,
        approved: proposals.filter(p => p.status === "approved").length,
        rejected: proposals.filter(p => p.status === "rejected").length,
    };

    const recentProposals = proposals
        .sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.()?.getTime() ?? 0;
            const bTime = b.updatedAt?.toDate?.()?.getTime() ?? 0;
            return bTime - aTime;
        })
        .slice(0, 5);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                            Welcome back, {profile ? `${profile.firstName}` : "Supervisor"} 👋
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            Here's an overview of your assigned research proposals.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/supervisor/assigned")}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        View All Proposals
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                    <StatCard
                        title="Total Assigned"
                        value={stats.total}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        gradient="from-amber-500 to-blue-600"
                    />
                    <StatCard
                        title="Awaiting Review"
                        value={stats.submitted}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-amber-500 to-orange-500"
                    />
                    <StatCard
                        title="Under Review"
                        value={stats.underReview}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                        gradient="from-purple-500 to-violet-600"
                    />
                    <StatCard
                        title="Approved"
                        value={stats.approved}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-emerald-500 to-green-600"
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        gradient="from-red-500 to-rose-600"
                    />
                </div>

                {/* Academic Calendar Progress */}
                <AcademicProgressBar calendar={calendar} role="supervisor" />

                {/* Recent Proposals */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-700">Recent Proposals</h2>
                        <button
                            onClick={() => navigate("/supervisor/assigned")}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            View all →
                        </button>
                    </div>

                    {recentProposals.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-400 text-sm font-semibold">No proposals assigned yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentProposals.map((proposal) => (
                                <div
                                    key={proposal.id}
                                    onClick={() => navigate(`/supervisor/proposals/${proposal.id}`)}
                                    className="px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{proposal.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                            {proposal.updatedAt?.toDate ? proposal.updatedAt.toDate().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        proposal.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                        proposal.status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                                        proposal.status === "under_review" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                        proposal.status === "submitted" || proposal.status === "resubmitted" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                        "bg-slate-50 text-slate-500 border border-slate-100"
                                    }`}>
                                        {proposal.status.replace("_", " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}