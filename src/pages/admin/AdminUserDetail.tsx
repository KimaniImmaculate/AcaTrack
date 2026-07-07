import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";


interface ProposalUser {
    [key: string]: UserProfile;
}



export default function AdminUserDetail() {


    const { id } = useParams();


    const [user, setUser] = useState<UserProfile | null>(null);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const [relatedUsers, setRelatedUsers] = useState<ProposalUser>({});

    const [loading, setLoading] = useState(true);



    useEffect(() => {


        if (!id) return;



        const loadUser = async () => {


            const userSnap = await getDoc(
                doc(db, "users", id)
            );


            if (!userSnap.exists()) {

                setLoading(false);
                return;

            }



            const userData = {

                id: userSnap.id,

                ...(userSnap.data() as Omit<UserProfile, "id">)

            };



            setUser(userData);



            const field =
                userData.role === "supervisor"
                    ? "supervisorId"
                    : "studentId";



            const proposalQuery = query(

                collection(db, "proposals"),

                where(field, "==", id)

            );



            const unsubscribe = onSnapshot(

                proposalQuery,

                async (snapshot) => {



                    const proposalData: Proposal[] =
                        snapshot.docs.map((doc) => ({

                            id: doc.id,

                            ...(doc.data() as Omit<Proposal, "id">)

                        }));



                    setProposals(proposalData);



                    const usersMap: ProposalUser = {};



                    for (const proposal of proposalData) {


                        const relatedId =
                            userData.role === "supervisor"
                                ? proposal.studentId
                                : proposal.supervisorId;



                        if (
                            relatedId &&
                            !usersMap[relatedId]
                        ) {


                            const relatedSnap = await getDoc(

                                doc(
                                    db,
                                    "users",
                                    relatedId
                                )

                            );



                            if (relatedSnap.exists()) {


                                usersMap[relatedId] = {

                                    id: relatedSnap.id,

                                    ...(relatedSnap.data() as Omit<UserProfile, "id">)

                                };


                            }


                        }


                    }



                    setRelatedUsers(usersMap);

                    setLoading(false);



                }

            );



            return unsubscribe;


        };



        loadUser();



    }, [id]);





    if (loading) {

        return (

            <DashboardLayout>

                <div className="p-6">
                    Loading user details...
                </div>

            </DashboardLayout>

        );

    }





    if (!user) {


        return (

            <DashboardLayout>

                <div className="p-6">
                    User not found.
                </div>

            </DashboardLayout>

        );

    }





    return (

        <DashboardLayout>


            <div className="p-6 max-w-5xl">



                <h1 className="text-2xl font-bold mb-6">

                    {user.firstName} {user.lastName}

                </h1>





                <div className="bg-white border rounded-lg p-6 space-y-3">


                    <h2 className="font-semibold text-lg">
                        Personal Information
                    </h2>



                    <p>
                        Email: {user.email}
                    </p>


                    <p>
                        Role: {user.role}
                    </p>


                    <p>
                        Department: {user.department || "Not set"}
                    </p>



                    {user.role === "student" && (

                        <p>
                            Admission Number:
                            {" "}
                            {user.admissionNumber || "Not set"}
                        </p>

                    )}



                    {user.role === "supervisor" && (

                        <p>
                            Staff Number:
                            {" "}
                            {user.staffNumber || "Not set"}
                        </p>

                    )}




                    <p>

                        Account Created:

                        {" "}

                        {user.createdAt?.toDate
                            ? user.createdAt.toDate().toLocaleString()
                            : "Unknown"
                        }

                    </p>



                </div>






                <div className="mt-8">


                    <h2 className="text-xl font-semibold mb-4">

                        Proposal Activity

                    </h2>




                    {proposals.length === 0 ? (


                        <p className="text-gray-500">
                            No proposals found.
                        </p>


                    ) : (


                        <div className="space-y-4">



                            {proposals.map((proposal) => {


                                const otherUserId =
                                    user.role === "supervisor"
                                        ? proposal.studentId
                                        : proposal.supervisorId;



                                const otherUser =
                                    otherUserId
                                        ? relatedUsers[otherUserId]
                                        : null;



                                return (

                                    <div

                                        key={proposal.id}

                                        className="border rounded-lg p-5 bg-white"

                                    >


                                        <h3 className="font-semibold text-lg">

                                            {proposal.title}

                                        </h3>




                                        <div className="mt-2">

                                            <StatusBadge
                                                status={proposal.status}
                                            />

                                        </div>





                                        {user.role === "supervisor" && (

                                            <p className="mt-3 text-sm">

                                                Student:
                                                {" "}
                                                {otherUser
                                                    ? `${otherUser.firstName} ${otherUser.lastName}`
                                                    : "Unknown"
                                                }

                                            </p>

                                        )}




                                        {user.role === "student" && (

                                            <p className="mt-3 text-sm">

                                                Supervisor:
                                                {" "}
                                                {otherUser
                                                    ? `${otherUser.firstName} ${otherUser.lastName}`
                                                    : "Not assigned"
                                                }

                                            </p>

                                        )}






                                        <p className="text-sm mt-2">

                                            Version:
                                            {" "}
                                            {proposal.version}

                                        </p>





                                        <p className="text-sm mt-2">

                                            Created:

                                            {" "}

                                            {proposal.createdAt?.toDate
                                                ? proposal.createdAt.toDate().toLocaleString()
                                                : "Unknown"
                                            }

                                        </p>




                                        <p className="text-sm mt-2">

                                            Last Updated:

                                            {" "}

                                            {proposal.updatedAt?.toDate
                                                ? proposal.updatedAt.toDate().toLocaleString()
                                                : "Unknown"
                                            }

                                        </p>



                                    </div>

                                );


                            })}


                        </div>


                    )}


                </div>


            </div>


        </DashboardLayout>

    );

}