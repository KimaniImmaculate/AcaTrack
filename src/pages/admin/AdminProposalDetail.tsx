import { useEffect, useState } from "react";
import {
    doc,
    onSnapshot,
    collection
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";


export default function AdminProposalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snapshot) => {
                if (snapshot.exists()) {
                    setProposal({ id: snapshot.id, ...(snapshot.data() as Omit<Proposal, "id">) });
                }
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const getUserName = (userId?: string | null) => {
        if (!userId) return "Not Assigned";
        const user = users.find(u => u.id === userId);
        if (!user) return "User unavailable";
        return `${user.prefix ? `${user.prefix} ` : ""}${user.firstName} ${user.lastName}`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading proposal...</div>
            </DashboardLayout>
        );
    }

    if (!proposal) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Proposal not found.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Back link */}
                <button
                    onClick={() => navigate("/admin/proposals")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Proposals
                </button>

                {/* Title Header Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight leading-snug">
                        {proposal.title}
                    </h1>
                    <div className="flex items-center justify-between gap-4 flex-wrap border-t border-slate-100 pt-4">
                        <StatusBadge status={proposal.status} />
                        {proposal.updatedAt?.toDate && (
                            <span className="text-xs text-slate-400 font-medium">
                                Last updated:{" "}
                                {proposal.updatedAt.toDate().toLocaleDateString("en-US", {
                                    day: "numeric", month: "long", year: "numeric"
                                })}{" "}
                                •{" "}
                                {proposal.updatedAt.toDate().toLocaleTimeString("en-US", {
                                    hour: "numeric", minute: "2-digit"
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Parties & Document */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</h3>
                        <p className="text-slate-800 font-bold text-sm">{getUserName(proposal.studentId)}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{proposal.studentId}</p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisor</h3>
                        <p className="text-slate-800 font-bold text-sm">{getUserName(proposal.supervisorId)}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{proposal.supervisorId ?? "Not Assigned"}</p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Version {proposal.version}</p>
                        </div>
                        {proposal.documentURL ? (
                            <a
                                href={proposal.documentURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold text-xs hover:underline gap-1.5 mt-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Document
                            </a>
                        ) : (
                            <p className="text-slate-400 text-xs font-medium italic">No document attached.</p>
                        )}
                    </div>
                </div>

                {/* Proposal Content */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">
                        Proposal Specifications
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: "Department", value: proposal.department },
                            { label: "Abstract", value: proposal.abstract },
                            { label: "Problem Statement", value: proposal.problemStatement },
                            { label: "Objectives", value: proposal.objectives },
                            { label: "Methodology", value: proposal.methodology },
                            { label: "Expected Outcome", value: proposal.expectedOutcome },
                        ].map((field) => (
                            <div key={field.label} className="space-y-1.5">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {field.label}
                                </span>
                                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 border border-slate-100 rounded-xl p-4 whitespace-pre-line">
                                    {field.value || "Not provided"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comments & Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CommentsList proposalId={proposal.id} />
                    <ActivityTimeline proposalId={proposal.id} />
                </div>
            </div>
        </DashboardLayout>
    );
}