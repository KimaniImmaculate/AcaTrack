import { useEffect, useState } from "react";

import {
    collection,
    onSnapshot,
    getDoc,
    doc
} from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";


export default function AdminMeetings() {


    const [meetings, setMeetings] = useState<any[]>([]);

    const [names, setNames] =
        useState<Record<string, string>>({});

    const navigate = useNavigate();



    const [
        activeFilter,
        setActiveFilter
    ] = useState<
        | "all"
        | "pending"
        | "approved_waiting_link"
        | "scheduled"
        | "completed"
        | "cancelled"
    >("all");




    useEffect(() => {


        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "meetingRequests"
                ),

                snapshot => {


                    const data =
                        snapshot.docs.map(doc => ({

                            id: doc.id,

                            ...doc.data()

                        }));


                    setMeetings(data);



                    loadNames(data);


                }

            );



        return () =>
            unsubscribe();


    }, []);







    async function loadNames(data: any[]) {


        for (const meeting of data) {


            const ids = [

                meeting.studentId,

                meeting.supervisorId

            ];



            for (const id of ids) {


                if (!id || names[id])
                    continue;



                const userSnap =
                    await getDoc(

                        doc(
                            db,
                            "users",
                            id
                        )

                    );



                if (userSnap.exists()) {


                    const user =
                        userSnap.data();



                    setNames(prev => ({

                        ...prev,

                        [id]:
                            `${user.firstName} ${user.lastName}`

                    }));


                }


            }


        }


    }








    const filteredMeetings =
        activeFilter === "all"

            ? meetings

            :

            meetings.filter(
                meeting =>
                    meeting.status === activeFilter
            );








    return (


        <DashboardLayout>


            <div className="space-y-8">



                <div>


                    <h1 className="text-2xl font-black text-slate-800">

                        All Meetings

                    </h1>


                    <p className="text-sm text-slate-400 mt-1">

                        Monitor all student-supervisor meetings across AcaTrack.

                    </p>


                </div>








                {/* FILTERS */}


                <div className="flex flex-wrap gap-3">


                    {
                        [
                            ["all", "All"],
                            ["pending", "Pending"],
                            ["approved_waiting_link", "Awaiting Link"],
                            ["scheduled", "Upcoming"],
                            ["completed", "Completed"],
                            ["cancelled", "Cancelled"]
                        ].map(([value, label]) => (


                            <button

                                key={value}

                                onClick={() =>
                                    setActiveFilter(
                                        value as any
                                    )
                                }

                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${activeFilter === value
                                    ? value === "pending"
                                        ? "bg-yellow-500 text-white"
                                        : value === "approved_waiting_link"
                                            ? "bg-blue-500 text-white"
                                            : value === "scheduled"
                                                ? "bg-pink-600 text-white"
                                                : value === "completed"
                                                    ? "bg-emerald-600 text-white"
                                                    : value === "cancelled"
                                                        ? "bg-red-600 text-white"
                                                        : "bg-amber-500 text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}

                            >

                                {label}

                            </button>


                        ))
                    }


                </div>









                {/* TABLE */}


                <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">


                    <table className="w-full text-sm">


                        <thead className="bg-slate-50">


                            <tr>


                                <th className="p-4 text-left">
                                    Student
                                </th>


                                <th className="p-4 text-left">
                                    Supervisor
                                </th>


                                <th className="p-4 text-left">
                                    Date
                                </th>


                                <th className="p-4 text-left">
                                    Time
                                </th>


                                <th className="p-4 text-left">
                                    Status
                                </th>


                                <th className="p-4 text-left">
                                    Action
                                </th>


                            </tr>


                        </thead>






                        <tbody>


                            {
                                filteredMeetings.length === 0 && (


                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-slate-400"
                                        >

                                            No meetings found.

                                        </td>

                                    </tr>


                                )
                            }







                            {
                                filteredMeetings.map(meeting => (


                                    <tr
                                        key={meeting.id}
                                        className="border-t"
                                    >



                                        <td className="p-4 font-semibold">


                                            {
                                                names[
                                                meeting.studentId
                                                ]
                                                ||
                                                "Loading..."
                                            }


                                        </td>





                                        <td className="p-4">


                                            {
                                                names[
                                                meeting.supervisorId
                                                ]
                                                ||
                                                "Loading..."
                                            }


                                        </td>





                                        <td className="p-4">


                                            {meeting.requestedDate}


                                        </td>





                                        <td className="p-4">


                                            {meeting.requestedTime}


                                        </td>





                                        <td className="p-4">


                                            <span


                                                className={`px-3 py-1 rounded-full text-xs font-bold
    ${meeting.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : meeting.status === "approved_waiting_link"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : meeting.status === "scheduled"
                                                                ? "bg-pink-100 text-pink-700"
                                                                : meeting.status === "completed"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-red-100 text-red-700"
                                                    }`}

                                            >


                                                {
                                                    meeting.status
                                                }


                                            </span>


                                        </td>







                                        <td className="p-4">


                                            <button
                                                onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                                                className="text-blue-600 font-bold hover:underline"
                                            >
                                                View
                                            </button>


                                        </td>



                                    </tr>


                                ))
                            }


                        </tbody>


                    </table>


                </div>






            </div>


        </DashboardLayout >


    );

}