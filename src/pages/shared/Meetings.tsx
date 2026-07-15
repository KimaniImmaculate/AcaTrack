import { useEffect, useState } from "react";

import {
    collection,
    query,
    where,
    onSnapshot,
    getDoc,
    doc
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { completeMeeting } from "../../services/meetingService";


export default function Meetings() {

    const { user, role, profile } = useAuth();

    const [meetings, setMeetings] = useState<any[]>([]);
    const [names, setNames] = useState<Record<string, string>>({});

    const [activeTab, setActiveTab] = useState<
        "scheduled" | "completed" | "cancelled"
    >("scheduled");


    useEffect(() => {

        if (!user || !role) return;


        let q;


        // ADMIN SEES ALL MEETINGS
        if (role === "admin") {

            q = query(

                collection(db, "meetingRequests"),

                where(
                    "status",
                    "==",
                    activeTab
                )

            );


        } else {


            const field =
                role === "student"
                    ? "studentId"
                    : "supervisorId";


            q = query(

                collection(db, "meetingRequests"),

                where(
                    field,
                    "==",
                    user.uid
                ),

                where(
                    "status",
                    "==",
                    activeTab
                )

            );

        }



        const unsubscribe = onSnapshot(

            q,

            async (snapshot) => {


                const data = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...(doc.data() as any)

                }));


                setMeetings(data);



                // Load names

                for (const meeting of data) {


                    const ids = [

                        meeting.studentId,

                        meeting.supervisorId

                    ];



                    for (const id of ids) {


                        if (!id || names[id]) continue;



                        const userSnap = await getDoc(

                            doc(
                                db,
                                "users",
                                id
                            )

                        );



                        if (userSnap.exists()) {


                            const userData = userSnap.data();


                            setNames(prev => ({

                                ...prev,

                                [id]:

                                    `${userData.firstName} ${userData.lastName}`

                            }));


                        }

                    }

                }


            }

        );



        return () => unsubscribe();


    }, [user, role, activeTab]);





    return (

        <DashboardLayout>


            <div className="max-w-5xl mx-auto space-y-8">


                <div>

                    <h1 className="text-2xl font-black text-slate-800">
                        Meetings
                    </h1>


                    <p className="text-sm text-slate-400">
                        Manage supervision meetings.
                    </p>

                </div>





                {/* FILTER TABS */}

                <div className="flex gap-3 flex-wrap">


                    <button

                        onClick={() => setActiveTab("scheduled")}

                        className={`px-5 py-2 rounded-xl font-bold text-sm ${activeTab === "scheduled"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}

                    >

                        Upcoming

                    </button>




                    <button

                        onClick={() => setActiveTab("completed")}

                        className={`px-5 py-2 rounded-xl font-bold text-sm ${activeTab === "completed"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}

                    >

                        Completed

                    </button>





                    <button

                        onClick={() => setActiveTab("cancelled")}

                        className={`px-5 py-2 rounded-xl font-bold text-sm ${activeTab === "cancelled"
                                ? "bg-red-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}

                    >

                        Cancelled

                    </button>


                </div>






                {
                    meetings.length === 0 ? (


                        <div className="bg-white border rounded-2xl p-8 text-center">


                            <p className="text-slate-400 font-semibold">

                                {
                                    activeTab === "scheduled"
                                        ?
                                        "No upcoming meetings."
                                        :
                                        activeTab === "completed"
                                            ?
                                            "No completed meetings."
                                            :
                                            "No cancelled meetings."
                                }

                            </p>


                        </div>


                    )

                        :


                        (

                            <div className="grid gap-6">


                                {
                                    meetings.map(meeting => (


                                        <div

                                            key={meeting.id}

                                            className="bg-white border rounded-2xl p-6 shadow-sm space-y-5"

                                        >



                                            <div className="flex justify-between">


                                                <div>


                                                    <h2 className="font-bold text-lg text-slate-800">

                                                        {meeting.title}

                                                    </h2>


                                                    <p className="text-sm text-slate-500">

                                                        {meeting.agenda}

                                                    </p>


                                                </div>



                                                <span

                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${meeting.status === "completed"
                                                            ?
                                                            "bg-emerald-100 text-emerald-700"

                                                            :

                                                            meeting.status === "cancelled"
                                                                ?
                                                                "bg-red-100 text-red-700"

                                                                :

                                                                "bg-green-100 text-green-700"

                                                        }`}

                                                >

                                                    {
                                                        meeting.status === "completed"
                                                            ?
                                                            "Completed"

                                                            :

                                                            meeting.status === "cancelled"
                                                                ?
                                                                "Cancelled"

                                                                :

                                                                "Scheduled"
                                                    }


                                                </span>


                                            </div>







                                            <div className="space-y-2 text-sm">



                                                {
                                                    role === "supervisor" && (

                                                        <p>

                                                            <strong>
                                                                Student:
                                                            </strong>{" "}

                                                            {
                                                                names[meeting.studentId]
                                                                ||
                                                                "Loading..."
                                                            }

                                                        </p>

                                                    )
                                                }




                                                {
                                                    role === "student" && (

                                                        <p>

                                                            <strong>
                                                                Supervisor:
                                                            </strong>{" "}

                                                            {
                                                                names[meeting.supervisorId]
                                                                ||
                                                                "Loading..."
                                                            }

                                                        </p>

                                                    )
                                                }




                                                {
                                                    role === "admin" && (

                                                        <>

                                                            <p>

                                                                <strong>
                                                                    Student:
                                                                </strong>{" "}

                                                                {
                                                                    names[meeting.studentId]
                                                                    ||
                                                                    "Loading..."
                                                                }

                                                            </p>


                                                            <p>

                                                                <strong>
                                                                    Supervisor:
                                                                </strong>{" "}

                                                                {
                                                                    names[meeting.supervisorId]
                                                                    ||
                                                                    "Loading..."
                                                                }

                                                            </p>


                                                        </>

                                                    )
                                                }





                                                <p>
                                                    <strong>Date:</strong>{" "}
                                                    {meeting.requestedDate}
                                                </p>


                                                <p>
                                                    <strong>Time:</strong>{" "}
                                                    {meeting.requestedTime}
                                                </p>


                                                <p>
                                                    <strong>Mode:</strong>{" "}
                                                    {meeting.mode}
                                                </p>


                                                <p>
                                                    <strong>Duration:</strong>{" "}
                                                    {meeting.duration}
                                                </p>





                                                {
                                                    meeting.status === "cancelled" && (

                                                        <p className="text-red-600">

                                                            <strong>
                                                                Reason:
                                                            </strong>{" "}

                                                            {
                                                                meeting.cancelReason
                                                                ||
                                                                "No reason provided"
                                                            }

                                                        </p>

                                                    )
                                                }


                                            </div>






                                            {
                                                meeting.status === "scheduled"
                                                &&
                                                meeting.meetingLink
                                                &&

                                                (

                                                    <a

                                                        href={meeting.meetingLink}

                                                        target="_blank"

                                                        rel="noopener noreferrer"

                                                        className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl font-bold"

                                                    >

                                                        Join Meeting

                                                    </a>

                                                )

                                            }







                                            {
                                                role === "supervisor"
                                                &&
                                                activeTab === "scheduled"

                                                &&

                                                (

                                                    <button

                                                        onClick={() =>

                                                            completeMeeting(

                                                                meeting.id,

                                                                meeting,

                                                                `${profile?.firstName} ${profile?.lastName}`

                                                            )

                                                        }


                                                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold"

                                                    >

                                                        Mark as Completed

                                                    </button>


                                                )

                                            }




                                        </div>


                                    ))

                                }


                            </div>

                        )

                }



            </div>


        </DashboardLayout>

    );

}