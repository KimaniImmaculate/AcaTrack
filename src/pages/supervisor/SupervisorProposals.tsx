import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    doc,
    getDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import { UserProfile } from "../../types/User";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import {
    startReview,
    requestRevision,
    approveProposal,
    rejectProposal
} from "../../services/proposalWorkflow";

type StudentMap = Record<string, UserProfile | "not_found">;

export default function SupervisorProposals() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentMap>({});
    const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        const q = query(
            collection(db, "proposals"),
            where("supervisorId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const data: Proposal[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Proposal, "id">),
            }));

            setProposals(data);
            setLoading(false);

            const uniqueIds = [...new Set(data.map(p => p.studentId).filter(Boolean))];
            const fetched: StudentMap = {};
            await Promise.all(
                uniqueIds.map(async (sid) => {
                    try {
                        const snap = await getDoc(doc(db, "users", sid));
                        fetched[sid] = snap.exists()
                            ? ({ id: snap.id, ...snap.data() } as UserProfile)
                            : "not_found";
                    } catch {
                        fetched[sid] = "not_found";
                    }
                })
            );
            setStudents(fetched);
        });

        return () => unsubscribe();
    }, [user]);

    const actorDetails = {
        uid: user?.uid ?? "",
        name: profile ? `${profile.prefix ? `${profile.prefix} ` : ""}${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
        role: "supervisor" as const
    };

    const getStudent = (studentId: string) => {
        const s = students[studentId];
        if (!s || s === "not_found") return null;
        return s;
    };

    const filteredProposals = filter === "all"
        ? proposals
        : proposals.filter(p => p.status === filter);

    const statusOptions = [
        { key: "all", label: "All" },
        { key: "submitted", label: "Submitted" },
        { key: "resubmitted", label: "Resubmitted" },
        { key: "under_review", label: "Under Review" },
        { key: "revision_requested", label: "Revision Req." },
        { key: "approved", label: "Approved" },
        { key: "rejected", label: "Rejected" },
    ];

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
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                        Assigned Proposals
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        All proposals assigned to you for review and supervision.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {statusOptions.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setFilter(opt.key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                filter === opt.key
                                    ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/10"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <span className="ml-auto text-xs font-semibold text-slate-400">
                        {filteredProposals.length} proposal{filteredProposals.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {filteredProposals.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-semibold text-sm">No proposals found.</p>
                        <p className="text-slate-400 text-xs mt-1">
                            {filter === "all" ? "No proposals have been assigned to you." : `No proposals with status "${filter.replace("_", " ")}".`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProposals.map((proposal) => {
                            const student = getStudent(proposal.studentId);
                            return (
                                <div
                                    key={proposal.id}
                                    className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
                                >
                                    {/* Card Header - clickable */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                        onClick={() => navigate(`/supervisor/proposals/${proposal.id}`)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-bold text-slate-800 text-base leading-snug">
                                                    {proposal.title}
                                                </h2>
                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                    <StatusBadge status={proposal.status} />
                                                    {proposal.updatedAt?.toDate && (
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {proposal.updatedAt.toDate().toLocaleDateString("en-US", {
                                                                day: "numeric", month: "short", year: "numeric"
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <svg className="w-4 h-4 text-slate-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>

                                        {/* Student info */}
                                        <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student</span>
                                                <p className="text-slate-700 font-semibold mt-0.5">
                                                    {student ? `${student.firstName} ${student.lastName}` : "Details not found"}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Admission No.</span>
                                                <p className="text-slate-700 font-semibold mt-0.5">
                                                    {student?.admissionNumber ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status alerts */}
                                    {proposal.status === "revision_requested" && (
                                        <div className="mx-6 mb-4 px-4 py-2.5 bg-amber-50/80 border border-amber-100 rounded-xl text-xs font-semibold text-amber-700">
                                            ⚠ Waiting for student to revise and resubmit.
                                        </div>
                                    )}
                                    {proposal.status === "resubmitted" && (
                                        <div className="mx-6 mb-4 px-4 py-2.5 bg-amber-50/80 border border-amber-100 rounded-xl text-xs font-semibold text-amber-700">
                                            ✓ Student has resubmitted — ready for your review.
                                        </div>
                                    )}

                                    {/* Action area */}
                                    {(proposal.status === "submitted" || proposal.status === "resubmitted" || proposal.status === "under_review") && (
                                        <div className="px-6 pb-6 space-y-3 border-t border-slate-50 pt-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                                    Review Comments / Revision Feedback
                                                </label>
                                                <textarea
                                                    placeholder="Write feedback or requested changes (only sent when requesting revisions)..."
                                                    value={commentsMap[proposal.id] || ""}
                                                    onChange={(e) => setCommentsMap({ ...commentsMap, [proposal.id]: e.target.value })}
                                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="flex gap-2 flex-wrap">
                                                {(proposal.status === "submitted" || proposal.status === "resubmitted") && (
                                                    <button
                                                        onClick={() => { if (!user) return; startReview(proposal, actorDetails); }}
                                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                                    >
                                                        Start Review
                                                    </button>
                                                )}
                                                {proposal.status === "under_review" && (
                                                    <button
                                                        onClick={() => { if (!user) return; approveProposal(proposal, actorDetails); }}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (!user) return;
                                                        await requestRevision(proposal, actorDetails, commentsMap[proposal.id]);
                                                        setCommentsMap({ ...commentsMap, [proposal.id]: "" });
                                                    }}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                                >
                                                    Request Revisions
                                                </button>
                                                <button
                                                    onClick={() => { if (!user) return; rejectProposal(proposal, actorDetails); }}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/supervisor/proposals/${proposal.id}`)}
                                                    className="ml-auto text-amber-600 hover:text-amber-700 font-bold text-xs px-4 py-2 hover:underline"
                                                >
                                                    Full Details →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
