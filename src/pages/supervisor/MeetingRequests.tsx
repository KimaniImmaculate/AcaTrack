import { useEffect, useState } from "react";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

import {
    acceptMeetingRequest,
    declineMeetingRequest
} from "../../services/meetingService";



export default function MeetingRequests() {


    const { user, profile } = useAuth();

    const [requests, setRequests] = useState<any[]>([]);



    useEffect(() => {


        if (!user) return;



        const q = query(

            collection(db, "meetingRequests"),

            where(
                "supervisorId",
                "==",
                user.uid
            ),

            where(
                "status",
                "==",
                "pending"
            )

        );



        const unsubscribe = onSnapshot(
            q,
            snapshot => {


                setRequests(

                    snapshot.docs.map(doc => ({

                        id: doc.id,

                        ...doc.data()

                    }))

                );


            }

        );



        return () => unsubscribe();


    }, [user]);





    return (

        <div className="space-y-6">


            <h2 className="text-2xl font-bold">
                Meeting Requests
            </h2>



            {
                requests.length === 0 ? (

                    <p className="text-slate-400">
                        No pending meeting requests.
                    </p>

                ) : (


                    requests.map(request => (

                        <MeetingCard

                            key={request.id}

                            request={request}

                        />

                    ))

                )
            }



        </div>

    );

}





function MeetingCard(
    {
        request
    }: any
) {


    const { profile } = useAuth();


    const [
        showDecline,
        setShowDecline
    ] = useState(false);


    const [
        reason,
        setReason
    ] = useState("");



    const [
        loading,
        setLoading
    ] = useState(false);





    const supervisorName =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`;



    return (

        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">


            <h3 className="text-lg font-bold">
                {request.title}
            </h3>



            <p>
                <strong>Agenda:</strong>{" "}
                {request.agenda}
            </p>



            <p>
                <strong>Date:</strong>{" "}
                {request.requestedDate}
            </p>



            <p>
                <strong>Time:</strong>{" "}
                {request.requestedTime}
            </p>



            <p>
                <strong>Mode:</strong>{" "}
                {request.mode}
            </p>





            <div className="flex gap-3">


                <button

                    disabled={loading}

                    onClick={async () => {


                        setLoading(true);


                        try {


                            await acceptMeetingRequest(

                                request.id,

                                request,

                                supervisorName

                            );


                        }
                        finally {

                            setLoading(false);

                        }


                    }}

                    className="bg-green-600 text-white px-5 py-2 rounded-lg"

                >

                    {
                        loading
                            ?
                            "Approving..."
                            :
                            "Accept"
                    }


                </button>





                <button

                    onClick={() =>
                        setShowDecline(true)
                    }

                    className="bg-red-600 text-white px-5 py-2 rounded-lg"

                >

                    Decline

                </button>


            </div>





            {
                showDecline && (

                    <div className="space-y-3 border-t pt-4">


                        <input

                            placeholder="Reason for declining"

                            value={reason}

                            onChange={
                                e =>
                                    setReason(e.target.value)
                            }

                            className="border rounded-lg p-2 w-full"

                        />



                        <button

                            onClick={async () => {


                                await declineMeetingRequest(

                                    request.id,

                                    request,

                                    reason,

                                    supervisorName

                                );


                            }}

                            className="bg-red-700 text-white px-4 py-2 rounded-lg"

                        >

                            Confirm Decline

                        </button>


                    </div>

                )

            }



        </div>

    );

}