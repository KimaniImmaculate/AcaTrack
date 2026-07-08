import { useEffect, useState } from "react";

import {
    collection,
    onSnapshot,
    query,
    where
} from "firebase/firestore";

import {
    useNavigate
} from "react-router-dom";


import { db } from "../../services/firebase";

import {
    useAuth
} from "../../contexts/AuthContext";


import {
    Proposal
} from "../../types/Proposal";


import StatusBadge from "../../components/StatusBadge";


import {
    statusMessages,
    statusColors
} from "../../utils/statusIntelligence";




export default function Proposals() {


    const { user } = useAuth();

    const navigate = useNavigate();



    const [proposals, setProposals]
        =
        useState<Proposal[]>([]);


    const [loading, setLoading]
        =
        useState(true);





    useEffect(() => {


        if (!user) {

            setLoading(false);

            return;

        }



        const q = query(

            collection(db, "proposals"),

            where("studentId", "==", user.uid)

        );




        const unsubscribe =

            onSnapshot(q, (snapshot) => {


                const data: Proposal[] = snapshot.docs.map((doc) => ({

                    id: doc.id,

                    ...(doc.data() as Omit<Proposal, "id">)

                }));



                setProposals(data);

                setLoading(false);



            });



        return () => unsubscribe();



    }, [user]);





    if (loading) {

        return (

            <div className="p-6">

                Loading proposals...

            </div>

        );

    }






    return (

        <div className="p-6">


            <h1 className="text-2xl font-bold mb-6">

                My Proposals

            </h1>





            {
                proposals.length === 0 ?


                    <p className="text-gray-500">

                        No proposals created yet.

                    </p>



                    :


                    <div className="space-y-4">


                        {

                            proposals.map((p) => (


                                <div

                                    key={p.id}

                                    className="border rounded p-4 hover:bg-gray-50"

                                >


                                    <div

                                        onClick={() => navigate(`/student/proposals/${p.id}`)}

                                        className="cursor-pointer"

                                    >


                                        <h2 className="font-semibold text-lg">

                                            {p.title}

                                        </h2>




                                        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                                            <StatusBadge status={p.status} />
                                            {p.updatedAt?.toDate && (
                                                <span className="text-xs text-gray-400">
                                                    Updated:{" "}
                                                    {p.updatedAt.toDate().toLocaleDateString("en-US", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}{" "}
                                                    •{" "}
                                                    {p.updatedAt.toDate().toLocaleTimeString("en-US", {
                                                        hour: "numeric", minute: "2-digit"
                                                    })}
                                                </span>
                                            )}
                                        </div>




                                        <p className={

                                            `text-sm mt-2 ${statusColors[p.status]}`

                                        }>

                                            {statusMessages[p.status]}

                                        </p>



                                    </div>






                                    {

                                        (p.status === "draft" ||

                                            p.status === "revision_requested")

                                        &&


                                        <button

                                            onClick={() => navigate(`/student/proposals/${p.id}`)}

                                            className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded"

                                        >

                                            Edit Proposal

                                        </button>


                                    }





                                </div>


                            ))

                        }


                    </div>


            }



        </div>

    );


}