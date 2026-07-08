import { useEffect, useState } from "react";
import {
    doc,
    onSnapshot,
    collection
} from "firebase/firestore";
import { useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";


export default function AdminProposalDetail() {

    const { id } = useParams();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);



    // FETCH PROPOSAL
    useEffect(() => {

        if (!id) return;


        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snapshot) => {

                if (snapshot.exists()) {

                    setProposal({
                        id: snapshot.id,
                        ...(snapshot.data() as Omit<Proposal, "id">)
                    });

                }


                setLoading(false);

            }
        );


        return () => unsubscribe();


    }, [id]);




    // FETCH USERS
    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {

                setUsers(
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );

            }
        );


        return () => unsubscribe();


    }, []);




    const getUserName = (userId?: string | null) => {

        if (!userId) {
            return "Not Assigned";
        }


        const user = users.find(
            u => u.id === userId
        );


        if (!user) {
            return "User unavailable";
        }


        return `${user.firstName} ${user.lastName}`;

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
                    Proposal not found.
                </div>
            </DashboardLayout>
        );

    }



    return (

        <DashboardLayout>


            <div className="p-6 max-w-5xl">


                <div className="mb-6">

                    <h1 className="text-2xl font-bold">
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

                </div>




                <div className="space-y-6 bg-white p-6 rounded border">


                    <section>
                        <h2 className="font-semibold">
                            Department
                        </h2>

                        <p>
                            {proposal.department || "Not provided"}
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
                            {proposal.problemStatement || "Not provided"}
                        </p>
                    </section>



                    <section>
                        <h2 className="font-semibold">
                            Objectives (Summary)
                        </h2>

                        <p>
                            {proposal.objectives || "Not provided"}
                        </p>
                    </section>



                    <section>
                        <h2 className="font-semibold">
                            Methodology (Summary)
                        </h2>

                        <p>
                            {proposal.methodology || "Not provided"}
                        </p>
                    </section>



                    <section>
                        <h2 className="font-semibold">
                            Expected Outcome (Summary)
                        </h2>

                        <p>
                            {proposal.expectedOutcome || "Not provided"}
                        </p>
                    </section>



                    <section>
                        <h2 className="font-semibold">
                            Student
                        </h2>

                        <p>
                            {getUserName(proposal.studentId)}
                        </p>

                        <p className="text-sm text-gray-500">
                            ID: {proposal.studentId}
                        </p>

                    </section>




                    <section>
                        <h2 className="font-semibold">
                            Supervisor
                        </h2>

                        <p>
                            {getUserName(proposal.supervisorId)}
                        </p>

                        <p className="text-sm text-gray-500">
                            ID: {proposal.supervisorId ?? "Not Assigned"}
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



                    <section>
                        <h2 className="font-semibold">
                            Complete Proposal Document
                        </h2>

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
                    </section>



                </div>

                <CommentsList proposalId={proposal.id} />

                <ActivityTimeline proposalId={proposal.id} />

            </div>


        </DashboardLayout>

    );

}