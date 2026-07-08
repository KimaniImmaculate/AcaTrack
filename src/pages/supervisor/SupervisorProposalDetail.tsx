import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import { UserProfile } from "../../types/User";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";

import { useAuth } from "../../contexts/AuthContext";
import {
    startReview,
    requestRevision,
    approveProposal,
    rejectProposal
} from "../../services/proposalWorkflow";


export default function SupervisorProposalDetail() {

    const { user, profile } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [proposal, setProposal] = useState<Proposal | null>(null);
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


    // Fetch student profile when proposal loads
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



                    <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                        <StatusBadge status={proposal.status} />
                        {proposal.updatedAt?.toDate && (
                            <span className="text-xs text-gray-400">
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


                    {/* Student info */}
                    <div className="mt-4 p-4 bg-gray-50 border rounded text-sm space-y-1">
                        <p className="font-semibold text-gray-700 mb-1">Student</p>
                        {student === null ? (
                            <p className="text-gray-400">Loading student details...</p>
                        ) : student === "not_found" ? (
                            <p className="text-gray-500">Details not found</p>
                        ) : (
                            <>
                                <p>
                                    <span className="font-medium text-gray-600">Name: </span>
                                    {student.firstName} {student.lastName}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Admission No: </span>
                                    {student.admissionNumber ?? "Details not found"}
                                </p>
                            </>
                        )}
                    </div>


                    {/* Complete Proposal Document */}
                    <div className="mt-4 p-4 bg-gray-50 border rounded text-sm space-y-1">
                        <p className="font-semibold text-gray-700 mb-1">Complete Proposal Document</p>
                        {proposal.documentURL ? (
                            <a
                                href={proposal.documentURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:underline gap-1 mt-1 font-medium"
                            >
                                📄 View Complete Proposal Document
                            </a>
                        ) : (
                            <p className="text-gray-500 italic">No document attached.</p>
                        )}
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
                                Abstract (Summary)
                            </h2>

                            <p>
                                {proposal.abstract}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Problem Statement (Summary)
                            </h2>

                            <p>
                                {proposal.problemStatement}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Objectives (Summary)
                            </h2>

                            <p>
                                {proposal.objectives}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Methodology (Summary)
                            </h2>

                            <p>
                                {proposal.methodology}
                            </p>
                        </section>




                        <section>
                            <h2 className="font-semibold">
                                Expected Outcome (Summary)
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
                        proposal.status === "resubmitted" ||
                        proposal.status === "under_review") && (
                        <div className="mb-6 p-4 border rounded bg-yellow-50/10 space-y-2 max-w-xl">
                            <label className="block text-sm font-semibold text-gray-700">
                                Review Comments / Revision Feedback
                            </label>
                            <textarea
                                className="w-full border rounded p-2 text-sm bg-white"
                                rows={3}
                                placeholder="Write the details of changes required (only sent when requesting revisions)..."
                                value={commentsText}
                                onChange={(e) => setCommentsText(e.target.value)}
                            />
                        </div>
                    )}

                    {(proposal.status === "submitted" ||
                        proposal.status === "resubmitted") && (

                            <div className="flex gap-3 flex-wrap">


                                <button
                                    disabled={actionLoading}
                                    onClick={() => {
                                        if (!user) return;
                                        handleAction(() =>
                                            startReview(proposal, {
                                                uid: user.uid,
                                                name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                                role: "supervisor"
                                            })
                                        );
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                                >
                                    Start Review
                                </button>




                                <button
                                    disabled={actionLoading}
                                    onClick={() => {
                                        if (!user) return;
                                        handleAction(async () => {
                                            await requestRevision(proposal, {
                                                uid: user.uid,
                                                name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                                role: "supervisor"
                                            }, commentsText);
                                            setCommentsText("");
                                        });
                                    }}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
                                >
                                    Request Revisions & Send Comments
                                </button>




                                <button
                                    disabled={actionLoading}
                                    onClick={() => {
                                        if (!user) return;
                                        handleAction(() =>
                                            rejectProposal(proposal, {
                                                uid: user.uid,
                                                name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                                role: "supervisor"
                                            })
                                        );
                                    }}
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
                                onClick={() => {
                                    if (!user) return;
                                    handleAction(() =>
                                        approveProposal(proposal, {
                                            uid: user.uid,
                                            name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                            role: "supervisor"
                                        })
                                    );
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                            >
                                Approve
                            </button>




                            <button
                                disabled={actionLoading}
                                onClick={() => {
                                    if (!user) return;
                                    handleAction(async () => {
                                        await requestRevision(proposal, {
                                            uid: user.uid,
                                            name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                            role: "supervisor"
                                        }, commentsText);
                                        setCommentsText("");
                                    });
                                }}
                                className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
                            >
                                Request Revisions & Send Comments
                            </button>




                            <button
                                disabled={actionLoading}
                                onClick={() => {
                                    if (!user) return;
                                    handleAction(() =>
                                        rejectProposal(proposal, {
                                            uid: user.uid,
                                            name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Supervisor",
                                            role: "supervisor"
                                        })
                                    );
                                }}
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

                <CommentsList proposalId={proposal.id} />

                <ActivityTimeline proposalId={proposal.id} />

            </div>


        </DashboardLayout>

    );

}