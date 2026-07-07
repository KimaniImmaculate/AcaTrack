import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";

import {
    startReview,
    requestRevision,
    approveProposal,
    rejectProposal
} from "../../services/proposalWorkflow";

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



    if (loading) {

        return (
            <DashboardLayout>
                <div className="p-6">
                    Loading supervisor dashboard...
                </div>
            </DashboardLayout>
        );

    }



    const submitted = proposals.filter(
        p =>
            p.status === "submitted" ||
            p.status === "resubmitted"
    );

    const underReview = proposals.filter(
        p => p.status === "under_review"
    );



    return (

        <DashboardLayout>

            <div className="mb-6">

                <h1 className="text-2xl font-bold">
                    Supervisor Dashboard
                </h1>

                <p className="text-gray-600">
                    Manage research proposal workflow
                </p>

            </div>



            {/* SUMMARY */}

            <div className="grid grid-cols-3 gap-4 mb-6">

                <div className="p-4 bg-white border rounded">

                    <p className="text-sm text-gray-500">
                        Total
                    </p>

                    <p className="text-xl font-bold">
                        {proposals.length}
                    </p>

                </div>


                <div className="p-4 bg-yellow-50 border rounded">

                    <p className="text-sm text-gray-500">
                        Submitted
                    </p>

                    <p className="text-xl font-bold">
                        {submitted.length}
                    </p>

                </div>


                <div className="p-4 bg-blue-50 border rounded">

                    <p className="text-sm text-gray-500">
                        Under Review
                    </p>

                    <p className="text-xl font-bold">
                        {underReview.length}
                    </p>

                </div>

            </div>



            {/* PROPOSALS */}

            <div className="space-y-4">

                {proposals.length === 0 ? (

                    <p className="text-gray-500">
                        No proposals assigned yet.
                    </p>

                ) : (

                    proposals.map((proposal) => (

                        <div
                            key={proposal.id}
                            className={`border rounded-lg p-5 bg-white shadow-sm ${proposal.status === "submitted" ||
                                    proposal.status === "resubmitted"
                                    ? "border-blue-300"
                                    : ""
                                }`}
                        >

                            <div
                                className="cursor-pointer"
                                onClick={() =>
                                    navigate(`/supervisor/proposals/${proposal.id}`)
                                }
                            >

                                <h2 className="font-semibold text-lg">
                                    {proposal.title}
                                </h2>

                                <div className="mt-2">
                                    <StatusBadge
                                        status={proposal.status}
                                    />
                                </div>

                            </div>



                            {proposal.status === "revision_requested" && (

                                <div className="mt-3 text-red-600 text-sm">

                                    ⚠ Waiting for student revision

                                </div>

                            )}



                            {proposal.status === "resubmitted" && (

                                <div className="mt-3 text-purple-600 text-sm">

                                    🔁 Student has resubmitted the proposal

                                </div>

                            )}



                            {(proposal.status === "submitted" ||
                                proposal.status === "resubmitted") && (

                                    <div className="flex gap-2 flex-wrap mt-4">

                                        <button
                                            onClick={() =>
                                                startReview(proposal)
                                            }
                                            className="px-4 py-2 rounded bg-blue-600 text-white"
                                        >
                                            Start Review
                                        </button>

                                        <button
                                            onClick={() =>
                                                requestRevision(proposal)
                                            }
                                            className="px-4 py-2 rounded bg-yellow-500 text-white"
                                        >
                                            Request Revision
                                        </button>

                                        <button
                                            onClick={() =>
                                                rejectProposal(proposal)
                                            }
                                            className="px-4 py-2 rounded bg-red-600 text-white"
                                        >
                                            Reject
                                        </button>

                                    </div>

                                )}



                            {proposal.status === "under_review" && (

                                <div className="flex gap-2 flex-wrap mt-4">

                                    <button
                                        onClick={() =>
                                            approveProposal(proposal)
                                        }
                                        className="px-4 py-2 rounded bg-green-600 text-white"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            requestRevision(proposal)
                                        }
                                        className="px-4 py-2 rounded bg-yellow-500 text-white"
                                    >
                                        Request Revision
                                    </button>

                                    <button
                                        onClick={() =>
                                            rejectProposal(proposal)
                                        }
                                        className="px-4 py-2 rounded bg-red-600 text-white"
                                    >
                                        Reject
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