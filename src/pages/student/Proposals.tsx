import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";
import DashboardLayout from "../../layouts/DashboardLayout";
import { statusMessages, statusColors } from "../../utils/statusIntelligence";

export default function Proposals() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "proposals"),
            where("studentId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Proposal[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Proposal, "id">)
            }));

            setProposals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">
                    Loading proposals...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                            My Proposals
                        </h1>
                        <p className="text-slate-400 text-sm font-semibold mt-1">
                            View, edit, and track status logs for all your research drafts
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/student/new-proposal")}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        Create Proposal
                    </button>
                </div>

                {proposals.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-semibold text-sm">No proposals created yet.</p>
                        <p className="text-slate-400 text-xs mt-1 mb-5">Submit a new draft topic to begin your review loop.</p>
                        <button
                            onClick={() => navigate("/student/new-proposal")}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            Create Your First Topic
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {proposals.map((p) => {
                            const isEditable = p.status === "draft" || p.status === "revision_requested";
                            return (
                                <div
                                    key={p.id}
                                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                                >
                                    <div
                                        onClick={() => navigate(`/student/proposals/${p.id}`)}
                                        className="cursor-pointer space-y-2 flex-1 min-w-0"
                                    >
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                                                {p.department || "General Department"}
                                            </span>
                                            <h2 className="font-bold text-slate-800 text-base group-hover:text-amber-600 transition-colors leading-snug truncate">
                                                {p.title}
                                            </h2>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge status={p.status} />
                                            {p.updatedAt?.toDate && (
                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                    Updated {p.updatedAt.toDate().toLocaleDateString("en-US", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-xs font-semibold ${statusColors[p.status] || "text-slate-500"}`}>
                                            {statusMessages[p.status]}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                        <button
                                            onClick={() => navigate(`/student/proposals/${p.id}`)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer w-full sm:w-auto text-center"
                                        >
                                            View
                                        </button>
                                        {isEditable && (
                                            <button
                                                onClick={() => navigate(`/student/proposals/${p.id}`)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer w-full sm:w-auto text-center whitespace-nowrap"
                                            >
                                                Edit & Resubmit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}