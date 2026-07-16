import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import { UserProfile } from "../../types/User";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";
import { useAuth } from "../../contexts/AuthContext";
import ReviewAssistantCard from "../../ai/components/ReviewAssistantCard";


import {
    startReview,
    requestRevision,
    approveProposal,
    rejectProposal
} from "../../services/proposalWorkflow";

import {
    doc,
    onSnapshot,
    getDoc,
    collection,
    query,
    where,
} from "firebase/firestore";

export default function SupervisorProposalDetail() {
    const { user, profile } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [student, setStudent] = useState<UserProfile | null | "not_found">(null);
    const [commentsText, setCommentsText] = useState("");

    useEffect(() => {
        if (!id) return;
        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snapshot) => {
                if (snapshot.exists()) {
                    setProposal({ id: snapshot.id, ...(snapshot.data() as Omit<Proposal, "id">) });
                } else {
                    setProposal(null);
                }
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const sid = proposal?.studentId;
        if (!sid) { setStudent(null); return; }
        getDoc(doc(db, "users", sid))
            .then(snap => {
                if (snap.exists()) {
                    setStudent({ id: snap.id, ...snap.data() } as UserProfile);
                } else {
                    setStudent("not_found");
                }
            })
            .catch(() => setStudent("not_found"));
    }, [proposal?.studentId]);
    useEffect(() => {
        if (!proposal?.id) return;

        const q = query(
            collection(db, "meetingsRequests"),
            where("proposalId", "==", proposal.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const meetingDoc = snapshot.docs[0];

                setMeeting({
                    id: meetingDoc.id,
                    ...meetingDoc.data()
                });
            } else {
                setMeeting(null);
            }
        });

        return () => unsubscribe();
    }, [proposal?.id]);

    const actorDetails = {
        uid: user?.uid ?? "",
        name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
        role: "supervisor" as const
    };

    const handleAction = async (action: () => Promise<void>) => {
        try {
            setActionLoading(true);
            await action();
        } catch (error) {
            console.error("Workflow error:", error);
            alert("Something went wrong while updating the proposal.");
        } finally {
            setActionLoading(false);
        }
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
                <div className="p-6 text-center space-y-4">
                    <p className="text-red-500 font-semibold">Proposal not found.</p>
                    <button
                        onClick={() => navigate("/supervisor")}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Back link */}
                <button
                    onClick={() => navigate("/supervisor")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
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

                {/* Student & Document Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Info */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student</h3>
                        {student === null ? (
                            <p className="text-slate-400 text-sm font-semibold">Loading student details...</p>
                        ) : student === "not_found" ? (
                            <p className="text-slate-500 text-sm font-semibold">Details not found</p>
                        ) : (
                            <div className="space-y-1.5">
                                <p className="text-slate-800 font-bold text-sm">
                                    {student.firstName} {student.lastName}
                                </p>
                                <p className="text-slate-400 text-xs font-medium">
                                    Admission No: {student.admissionNumber ?? "—"}
                                </p>
                                <p className="text-slate-400 text-xs font-medium">
                                    {student.department || "General Department"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Document */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proposal Document</h3>
                        {proposal.documentURL ? (
                            <a
                                href={proposal.documentURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold text-sm hover:underline gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                View Proposal Document
                            </a>
                        ) : (
                            <p className="text-slate-400 text-sm font-semibold">No document attached.</p>
                        )}
                    </div>
                </div>

                {meeting?.status === "scheduled" && (

                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6 space-y-4">


                        <h3 className="font-bold text-green-700 text-lg">
                            Supervision Meeting
                        </h3>



                        <p>
                            <strong>Date:</strong>{" "}
                            {meeting.requestedDate}
                        </p>


                        <p>
                            <strong>Time:</strong>{" "}
                            {meeting.requestedTime}
                        </p>


                        <p>
                            <strong>Duration:</strong>{" "}
                            {meeting.duration}
                        </p>


                        <p>
                            <strong>Mode:</strong>{" "}
                            {meeting.mode}
                        </p>


                        <p>
                            <strong>Agenda:</strong>{" "}
                            {meeting.agenda}
                        </p>



                        <p className="break-all">

                            <strong>Meeting Link:</strong>{" "}

                            <a

                                href={meeting.meetingLink}

                                target="_blank"

                                rel="noopener noreferrer"

                                className="text-blue-600 hover:underline"

                            >

                                {meeting.meetingLink}

                            </a>


                        </p>



                        <a

                            href={meeting.meetingLink}

                            target="_blank"

                            rel="noopener noreferrer"

                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"

                        >

                            Join Meeting

                        </a>



                    </div>

                )}

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
                            { label: "Version", value: String(proposal.version) },
                        ].map((field) => (
                            <div key={field.label} className="space-y-1.5">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {field.label}
                                </span>
                                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 border border-slate-100 rounded-xl p-4 whitespace-pre-line">
                                    {field.value || "Not specified"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Actions */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Review Actions</h3>

                    {(proposal.status === "submitted" || proposal.status === "resubmitted" || proposal.status === "under_review") && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Review Comments / Revision Feedback
                                </label>
                                <textarea
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-300"
                                    rows={3}
                                    placeholder="Write the details of changes required (only sent when requesting revisions)..."
                                    value={commentsText}
                                    onChange={(e) => setCommentsText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {(proposal.status === "submitted" || proposal.status === "resubmitted") && (
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleAction(() => startReview(proposal, actorDetails))}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        Start Review
                                    </button>
                                )}

                                {proposal.status === "under_review" && (
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleAction(() => approveProposal(proposal, actorDetails))}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        Approve Proposal
                                    </button>
                                )}

                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleAction(async () => {
                                        await requestRevision(proposal, actorDetails, commentsText);
                                        setCommentsText("");
                                    })}
                                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                >
                                    Request Revisions
                                </button>

                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleAction(() => rejectProposal(proposal, actorDetails))}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {proposal.status === "revision_requested" && (
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm font-semibold text-amber-700">
                            ⏳ Waiting for student to revise and resubmit.
                        </div>
                    )}

                    {proposal.status === "approved" && (
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-sm font-semibold text-emerald-700">
                            ✓ This proposal has been approved.
                        </div>
                    )}

                    {proposal.status === "rejected" && (
                        <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 text-sm font-semibold text-red-700">
                            ✗ This proposal has been rejected.
                        </div>
                    )}
                </div>

                {/* Comments & Activity */}
                <hr className="my-8 border-slate-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CommentsList proposalId={proposal.id} />
                    <ActivityTimeline proposalId={proposal.id} proposalTitle={proposal.title} />
                </div>
                <ReviewAssistantCard proposalId={proposal.id} />

            </div>


        </DashboardLayout>
    );
}