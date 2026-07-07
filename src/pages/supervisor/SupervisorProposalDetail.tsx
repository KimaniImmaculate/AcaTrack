import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";

import {
    startReview,
    requestRevision,
    approveProposal,
    rejectProposal
} from "../../services/proposalWorkflow";


export default function SupervisorProposalDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);



    useEffect(() => {

        if (!id) return;


        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snapshot) => {

                if (snapshot.exists()) {

                    setProposal({
                        id: snapshot.id,
                        ...(snapshot.data() as Omit<Proposal, "id">),
                    });

                } else {

                    setProposal(null);

                }


                setLoading(false);

            }
        );


        return () => unsubscribe();


    }, [id]);




    const handleAction = async (
        action: () => Promise<void>
    ) => {

        try {

            setActionLoading(true);

            await action();

        } catch (error) {

            console.error(
                "Workflow error:",
                error
            );

            alert(
                "Something went wrong while updating the proposal."
            );

        } finally {

            setActionLoading(false);

        }

    };





    if (loading) {

        return (

            <DashboardLayout>

                <div className="p-6">
                    Loading proposal...
                </div>

            </DashboardLayout>

        );

    }




    if (!proposal) {

        return (

            <DashboardLayout>

                <div className="p-6">

                    <p className="text-red-600">
                        Proposal not found.
                    </p>


                    <button
                        onClick={() => navigate("/supervisor")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Back
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




                <div className="bg-white border rounded-lg shadow p-6">


                    <h1 className="text-3xl font-bold">
                        {proposal.title}
                    </h1>



                    <div className="mt-3">

                        <StatusBadge
                            status={proposal.status}
                        />

                    </div>



                    <hr className="my-6" />



                    <div className="space-y-6">


                        <section>
                            <h2 className="font-semibold">
                                Department
                            </h2>

                            <p>
                                {proposal.department}
                            </p>
                        </section>



                        <section>
                            <h2 className="font-semibold">
                                Abstract
                            </h2>

                            <p>
                                {proposal.abstract}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Problem Statement
                            </h2>

                            <p>
                                {proposal.problemStatement}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Objectives
                            </h2>

                            <p>
                                {proposal.objectives}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Methodology
                            </h2>

                            <p>
                                {proposal.methodology}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Expected Outcome
                            </h2>

                            <p>
                                {proposal.expectedOutcome}
                            </p>
                        </section>



                        <section>
                            <h2 className="font-semibold">
                                Version
                            </h2>

                            <p>
                                {proposal.version}
                            </p>
                        </section>


                    </div>





                    <hr className="my-6" />




                    {(proposal.status === "submitted" ||
                        proposal.status === "resubmitted") && (

                            <div className="flex gap-3 flex-wrap">


                                <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                        handleAction(() =>
                                            startReview(proposal)
                                        )
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                                >
                                    Start Review
                                </button>




                                <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                        handleAction(() =>
                                            requestRevision(proposal)
                                        )
                                    }
                                    className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
                                >
                                    Request Revision
                                </button>




                                <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                        handleAction(() =>
                                            rejectProposal(proposal)
                                        )
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
                                >
                                    Reject
                                </button>



                            </div>

                        )}







                    {proposal.status === "under_review" && (

                        <div className="flex gap-3 flex-wrap">


                            <button
                                disabled={actionLoading}
                                onClick={() =>
                                    handleAction(() =>
                                        approveProposal(proposal)
                                    )
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                            >
                                Approve
                            </button>




                            <button
                                disabled={actionLoading}
                                onClick={() =>
                                    handleAction(() =>
                                        requestRevision(proposal)
                                    )
                                }
                                className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
                            >
                                Request Revision
                            </button>




                            <button
                                disabled={actionLoading}
                                onClick={() =>
                                    handleAction(() =>
                                        rejectProposal(proposal)
                                    )
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
                            >
                                Reject
                            </button>


                        </div>

                    )}






                    {proposal.status === "revision_requested" && (

                        <div className="p-4 bg-yellow-50 border rounded">

                            Waiting for student to revise and resubmit.

                        </div>

                    )}




                    {proposal.status === "approved" && (

                        <div className="p-4 bg-green-50 border rounded">

                            Proposal approved successfully.

                        </div>

                    )}




                    {proposal.status === "rejected" && (

                        <div className="p-4 bg-red-50 border rounded">

                            Proposal rejected.

                        </div>

                    )}



                </div>


            </div>


        </DashboardLayout>

    );

}