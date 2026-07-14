import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import AcademicProgressBar from "../../components/AcademicProgressBar";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";
import { Proposal } from "../../types/Proposal";
import ProgressCoachCard from "../../ai/components/ProgressCoachCard";

export default function StudentDashboard() {
    const { user, profile } = useAuth(); const navigate = useNavigate();
    const { calendar } = useAcademicCalendar();

    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "proposals"),
            where("studentId", "==", user.uid)
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
        draft: proposals.filter(p => p.status === "draft").length,
        submitted: proposals.filter(p => p.status === "submitted").length,
        approved: proposals.filter(p => p.status === "approved").length,
        rejected: proposals.filter(p => p.status === "rejected").length,
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                        Welcome back, {profile ? profile.firstName : "Student"} 👋
                    </h1>

                    <p className="text-slate-400 text-sm font-medium mt-1">

                        Track your research proposal progress, milestones, and supervisor feedback.

                    </p>

                </div>

                <button
                    onClick={() => navigate("/student/new-proposal")}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm cursor-pointer w-full sm:w-auto"
                >
                    Start New Proposal
                </button>

            </div>

            {/* Academic Calendar Progress */}
            <div className="mb-6">
                <AcademicProgressBar calendar={calendar} role="student" />
            </div>

            {/* Responsive Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total"
                    value={stats.total}
                    icon={
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                />
                <StatCard
                    title="Draft"
                    value={stats.draft}
                    icon={
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Submitted"
                    value={stats.submitted}
                    icon={
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    }
                />
                <StatCard
                    title="Approved"
                    value={stats.approved}
                    icon={
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Quick Helper Card if No Proposals Exist */}
            {stats.total === 0 && (
                <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-8 text-center max-w-lg mx-auto">
                    <div className="bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.238a5.002 5.002 0 01-.065-.08H12" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">No Research Proposals Found</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-6">
                        Submit your research topics and match with advisors for feedback commentary.
                    </p>
                    <button
                        onClick={() => navigate("/student/new-proposal")}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                        Create Your First Topic
                    </button>
                </div>
            )}

            <div className="mt-10">
                <ProgressCoachCard />
            </div>
        </DashboardLayout>

    );
}