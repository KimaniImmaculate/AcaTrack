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

// Map of studentId -> their profile
type StudentMap = Record<string, UserProfile | "not_found">;

export default function SupervisorProposals() {

    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentMap>({});
    const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});

    useEffect(() => {

        if (!user) {
            setLoading(false);
            return;
        }

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

            // Fetch student profiles for each unique studentId
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
        name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
        role: "supervisor" as const
    };

    const getStudent = (studentId: string) => {
        const s = students[studentId];
        if (!s || s === "not_found") return null;
        return s;
    };


    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading proposals...</div>
            </DashboardLayout>
        );
    }

    return (

        <DashboardLayout>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Assigned Proposals</h1>
                <p className="text-gray-600 mt-1">
                    All proposals assigned to you for review.
                </p>
            </div>

            {proposals.length === 0 ? (

                <p className="text-gray-500">No proposals assigned yet.</p>

            ) : (

                <div className="space-y-4">

                    {proposals.map((proposal) => {

                        const student = getStudent(proposal.studentId);

                        return (

                            <div
                                key={proposal.id}
                                className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >

                                {/* Title + status */}
                                <div
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/supervisor/proposals/${proposal.id}`)}
                                >
                                    <h2 className="font-semibold text-lg">{proposal.title}</h2>

                                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                                        <StatusBadge status={proposal.status} />
                                        {proposal.updatedAt?.toDate && (
                                            <span className="text-xs text-gray-400">
                                                Updated:{" "}
                                                {proposal.updatedAt.toDate().toLocaleDateString("en-US", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}{" "}
                                                •{" "}
                                                {proposal.updatedAt.toDate().toLocaleTimeString("en-US", {
                                                    hour: "numeric", minute: "2-digit"
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Student info */}
                                <div className="mt-3 text-sm text-gray-600 border-t pt-3 space-y-0.5">
                                    <p>
                                        <span className="font-medium text-gray-700">Student: </span>
                                        {student
                                            ? `${student.firstName} ${student.lastName}`
                                            : "Details not found"}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-700">Admission No: </span>
                                        {student?.admissionNumber ?? "Details not found"}
                                    </p>
                                </div>

                                {/* Status hints */}
                                {proposal.status === "revision_requested" && (
                                    <p className="text-red-600 text-sm mt-2">
                                        ⚠ Waiting for student revision
                                    </p>
                                )}
                                {proposal.status === "resubmitted" && (
                                    <p className="text-purple-600 text-sm mt-2">
                                        Student has resubmitted the proposal
                                    </p>
                                )}

                                {/* Card comments box */}
                                {(proposal.status === "submitted" || proposal.status === "resubmitted" || proposal.status === "under_review") && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                                            Review Comments / Requested Changes (For Revisions)
                                        </label>
                                        <textarea
                                            placeholder="Write feedback/requested changes here..."
                                            value={commentsMap[proposal.id] || ""}
                                            onChange={(e) => setCommentsMap({ ...commentsMap, [proposal.id]: e.target.value })}
                                            className="w-full border rounded p-2 text-sm bg-gray-50"
                                            rows={2}
                                        />
                                    </div>
                                )}

                                {/* Quick action buttons — submitted / resubmitted */}
                                {(proposal.status === "submitted" || proposal.status === "resubmitted") && (
                                    <div className="flex gap-2 flex-wrap mt-4">

                                        <button
                                            onClick={() => { if (!user) return; startReview(proposal, actorDetails); }}
                                            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
                                        >
                                            Start Review
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (!user) return;
                                                await requestRevision(proposal, actorDetails, commentsMap[proposal.id]);
                                                setCommentsMap({ ...commentsMap, [proposal.id]: "" });
                                            }}
                                            className="px-4 py-2 rounded bg-yellow-500 text-white text-sm"
                                        >
                                            Request Revisions & Send Comments
                                        </button>

                                        <button
                                            onClick={() => { if (!user) return; rejectProposal(proposal, actorDetails); }}
                                            className="px-4 py-2 rounded bg-red-600 text-white text-sm"
                                        >
                                            Reject
                                        </button>

                                    </div>
                                )}

                                {/* Quick action buttons — under review */}
                                {proposal.status === "under_review" && (
                                    <div className="flex gap-2 flex-wrap mt-4">

                                        <button
                                            onClick={() => { if (!user) return; approveProposal(proposal, actorDetails); }}
                                            className="px-4 py-2 rounded bg-green-600 text-white text-sm"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (!user) return;
                                                await requestRevision(proposal, actorDetails, commentsMap[proposal.id]);
                                                setCommentsMap({ ...commentsMap, [proposal.id]: "" });
                                            }}
                                            className="px-4 py-2 rounded bg-yellow-500 text-white text-sm"
                                        >
                                            Request Revisions & Send Comments
                                        </button>

                                        <button
                                            onClick={() => { if (!user) return; rejectProposal(proposal, actorDetails); }}
                                            className="px-4 py-2 rounded bg-red-600 text-white text-sm"
                                        >
                                            Reject
                                        </button>

                                    </div>
                                )}

                                {/* View full details */}
                                <button
                                    onClick={() => navigate(`/supervisor/proposals/${proposal.id}`)}
                                    className="mt-4 text-blue-600 text-sm hover:underline"
                                >
                                    View Full Details →
                                </button>

                            </div>

                        );
                    })}

                </div>

            )}

        </DashboardLayout>

    );

}
