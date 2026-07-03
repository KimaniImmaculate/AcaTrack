import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";

export default function SupervisorProposalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposal = async () => {
            if (!id) return;

            const ref = doc(db, "proposals", id);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setProposal({
                    id: snap.id,
                    ...(snap.data() as Omit<Proposal, "id">),
                });
            }

            setLoading(false);
        };

        fetchProposal();
    }, [id]);

    const updateStatus = async (status: Proposal["status"]) => {
        if (!proposal) return;

        await updateDoc(doc(db, "proposals", proposal.id), {
            status,
            updatedAt: serverTimestamp(),
        });

        setProposal({
            ...proposal,
            status,
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading proposal...</div>
            </DashboardLayout>
        );
    }

    if (!proposal) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <p className="text-red-600">Proposal not found.</p>

                    <button
                        onClick={() => navigate("/supervisor")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">

                <button
                    onClick={() => navigate("/supervisor")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Dashboard
                </button>

                <div className="bg-white border rounded-lg p-6 shadow">

                    <h1 className="text-3xl font-bold">
                        {proposal.title}
                    </h1>

                    <div className="mt-3">
                        <StatusBadge status={proposal.status} />
                    </div>

                    <hr className="my-6" />

                    <section className="space-y-6">

                        <div>
                            <h2 className="font-semibold text-lg">
                                Abstract
                            </h2>
                            <p>{proposal.abstract}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg">
                                Problem Statement
                            </h2>
                            <p>{proposal.problemStatement}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg">
                                Objectives
                            </h2>
                            <p>{proposal.objectives}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg">
                                Methodology
                            </h2>
                            <p>{proposal.methodology}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg">
                                Expected Outcome
                            </h2>
                            <p>{proposal.expectedOutcome}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg">
                                Department
                            </h2>
                            <p>{proposal.department}</p>
                        </div>

                    </section>

                    <hr className="my-6" />

                    {(proposal.status === "submitted" ||
                        proposal.status === "resubmitted") && (
                            <div className="flex gap-3 flex-wrap">

                                <button
                                    onClick={() => updateStatus("under_review")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Start Review
                                </button>

                                <button
                                    onClick={() => updateStatus("revision_requested")}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                                >
                                    Request Revision
                                </button>

                                <button
                                    onClick={() => updateStatus("rejected")}
                                    className="px-4 py-2 bg-red-600 text-white rounded"
                                >
                                    Reject
                                </button>

                            </div>
                        )}

                    {proposal.status === "under_review" && (
                        <div className="flex gap-3 flex-wrap">

                            <button
                                onClick={() => updateStatus("approved")}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => updateStatus("revision_requested")}
                                className="px-4 py-2 bg-yellow-500 text-white rounded"
                            >
                                Request Revision
                            </button>

                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}