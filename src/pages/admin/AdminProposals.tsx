import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import StatusBadge from "../../components/StatusBadge";
import { Proposal } from "../../types/Proposal";

export default function AdminProposals() {

    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    // FETCH PROPOSALS
    useEffect(() => {

        const q = query(
            collection(db, "proposals"),
            orderBy("createdAt", "desc")
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

    }, []);



    // FETCH USERS
    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {

                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setUsers(data);

            }
        );


        return () => unsubscribe();

    }, []);




    const getUserName = (userId?: string | null) => {

        if (!userId) {
            return "Not Assigned";
        }


        const user = users.find(
            (u) => u.id === userId
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
                    Loading proposals...
                </div>
            </DashboardLayout>
        );

    }



    return (

        <DashboardLayout>

            <div className="mb-6">

                <h1 className="text-2xl font-bold">
                    All Proposals
                </h1>

                <p className="text-gray-600">
                    View and monitor all research proposals.
                </p>

            </div>



            {proposals.length === 0 ? (

                <p className="text-gray-500">
                    No proposals found.
                </p>

            ) : (

                <div className="space-y-4">

                    {proposals.map((proposal) => (

                        <div
                            key={proposal.id}
                            onClick={() =>
                                navigate(`/admin/proposals/${proposal.id}`)
                            }
                            className="border rounded-lg p-5 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                        >

                            <div className="flex justify-between items-start">

                                <div>

                                    <h2 className="text-lg font-semibold">
                                        {proposal.title}
                                    </h2>


                                    <p className="text-sm text-gray-500 mt-1">
                                        Department: {proposal.department || "Not provided"}
                                    </p>

                                </div>


                                <StatusBadge status={proposal.status} />

                            </div>




                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">


                                <div>
                                    <span className="font-medium">
                                        Student:
                                    </span>{" "}
                                    {getUserName(proposal.studentId)}
                                </div>



                                <div>
                                    <span className="font-medium">
                                        Supervisor:
                                    </span>{" "}
                                    {getUserName(proposal.supervisorId)}
                                </div>



                                <div>
                                    <span className="font-medium">
                                        Version:
                                    </span>{" "}
                                    {proposal.version}
                                </div>



                                <div>
                                    <span className="font-medium">
                                        Proposal ID:
                                    </span>{" "}
                                    {proposal.id}
                                </div>


                            </div>


                        </div>

                    ))}


                </div>

            )}


        </DashboardLayout>

    );
}