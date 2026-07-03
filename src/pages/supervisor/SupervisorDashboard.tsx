import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";

export default function SupervisorDashboard() {
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
            where("supervisorId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Proposal[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Proposal, "id">),
            }));

            setProposals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateStatus = async (id: string, status: Proposal["status"]) => {
        await updateDoc(doc(db, "proposals", id), {
            status,
            updatedAt: serverTimestamp(),
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading supervisor dashboard...</div>
            </DashboardLayout>
        );
    }

    const submitted = proposals.filter(
        p => p.status === "submitted" || p.status === "resubmitted"
    );

    const underReview = proposals.filter(
        p => p.status === "under_review"
    );

    return (
        <DashboardLayout>

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Supervisor Dashboard
                </h1>
                <p className="text-gray-600">
                    Manage research proposal workflow
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-6">

                <div className="p-4 bg-white border rounded">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold">{proposals.length}</p>
                </div>

                <div className="p-4 bg-yellow-50 border rounded">
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="text-xl font-bold">{submitted.length}</p>
                </div>

                <div className="p-4 bg-blue-50 border rounded">
                    <p className="text-sm text-gray-500">Under Review</p>
                    <p className="text-xl font-bold">{underReview.length}</p>
                </div>
            </div>

            {/* LIST */}
            <div className="space-y-4">

                {proposals.length === 0 ? (
                    <p className="text-gray-500">
                        No proposals assigned yet.
                    </p>
                ) : (
                    proposals.map((p) => (
                        <div
                            key={p.id}
                            className={`p-4 border rounded shadow-sm ${p.status === "submitted" || p.status === "resubmitted"
                                ? "border-blue-300"
                                : ""
                                }`}
                        >

                            {/* HEADER */}
                            <div
                                className="cursor-pointer"
                                onClick={() =>
                                    navigate(`/supervisor/proposals/${p.id}`)
                                }
                            >
                                <h2 className="font-semibold">
                                    {p.title}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Status: <StatusBadge status={p.status} />
                                </p>
                            </div>

                            {/* INTELLIGENCE FEEDBACK */}
                            {p.status === "revision_requested" && (
                                <div className="mt-2 text-sm text-red-600">
                                    ⚠ Waiting for student revision
                                </div>
                            )}

                            {p.status === "resubmitted" && (
                                <div className="mt-2 text-sm text-purple-600">
                                    🔁 Resubmitted by student — awaiting review
                                </div>
                            )}

                            {/* ACTIONS (FIXED) */}
                            {(p.status === "submitted" || p.status === "resubmitted") && (
                                <div className="flex gap-2 mt-3 flex-wrap">

                                    <button
                                        onClick={() =>
                                            updateStatus(p.id, "under_review")
                                        }
                                        className="px-3 py-1 bg-blue-600 text-white rounded"
                                    >
                                        Start Review
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(p.id, "rejected")
                                        }
                                        className="px-3 py-1 bg-red-600 text-white rounded"
                                    >
                                        Reject
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(p.id, "revision_requested")
                                        }
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Request Revision
                                    </button>

                                </div>
                            )}

                            {p.status === "under_review" && (
                                <div className="flex gap-2 mt-3 flex-wrap">

                                    <button
                                        onClick={() =>
                                            updateStatus(p.id, "approved")
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(p.id, "revision_requested")
                                        }
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Request Revision
                                    </button>

                                </div>
                            )}

                        </div>
                    ))
                )}

            </div>

        </DashboardLayout>
    );
}
