import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

import AcademicProgressBar from "../../components/AcademicProgressBar";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";
import { saveAcademicCalendar } from "../../services/academicCalendarService";

import { getWorkflowHealth } from "../../ai/services/workflowHealth";
import { WorkflowHealth } from "../../ai/types";


export default function AdminDashboard() {


    const navigate = useNavigate();

    const { user } = useAuth();


    const {
        calendar,
        loading: calLoading
    } = useAcademicCalendar();



    const [users, setUsers] = useState<any[]>([]);

    const [proposals, setProposals] = useState<any[]>([]);

    const [meetings, setMeetings] = useState<any[]>([]);



    // Calendar form
    const [calForm, setCalForm] = useState({

        proposalStartDate: "",
        proposalDueDate: "",
        reviewDueDate: ""

    });



    const [calSaving, setCalSaving] = useState(false);

    const [calSaved, setCalSaved] = useState(false);

    const [calOpen, setCalOpen] = useState(false);



    const [
        workflowHealth,
        setWorkflowHealth
    ] = useState<WorkflowHealth | null>(null);




    /*
        AI WORKFLOW HEALTH
    */

    useEffect(() => {


        async function loadInsights() {

            const health =
                await getWorkflowHealth();


            setWorkflowHealth(health);

        }


        loadInsights();


    }, []);






    /*
        LOAD ACADEMIC CALENDAR
    */

    useEffect(() => {


        if (calendar) {


            setCalForm({

                proposalStartDate:
                    calendar.proposalStartDate,

                proposalDueDate:
                    calendar.proposalDueDate,

                reviewDueDate:
                    calendar.reviewDueDate

            });


        }


    }, [calendar]);








    /*
        LOAD USERS
    */

    useEffect(() => {


        const unsubscribe =
            onSnapshot(

                collection(db, "users"),

                snapshot => {


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








    /*
        LOAD PROPOSALS
    */

    useEffect(() => {


        const unsubscribe =
            onSnapshot(

                collection(db, "proposals"),

                snapshot => {


                    setProposals(

                        snapshot.docs.map(doc => ({

                            id: doc.id,

                            ...doc.data()

                        }))

                    );


                }

            );


        return () => unsubscribe();


    }, []);









    /*
        LOAD MEETINGS
        Admin sees ALL meetings
    */

    useEffect(() => {


        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "meetingRequests"
                ),

                snapshot => {


                    setMeetings(

                        snapshot.docs.map(doc => ({

                            id: doc.id,

                            ...doc.data()

                        }))

                    );


                }

            );


        return () => unsubscribe();


    }, []);









    const students =
        users.filter(
            u => u.role === "student"
        );



    const supervisors =
        users.filter(
            u => u.role === "supervisor"
        );



    const approved =
        proposals.filter(
            p => p.status === "approved"
        );



    const pending =
        proposals.filter(
            p =>
                p.status === "submitted" ||
                p.status === "resubmitted" ||
                p.status === "under_review"
        );




    /*
        MEETING ANALYTICS
    */

    const pendingMeetings = meetings.filter(
        meeting => meeting.status === "pending"
    );

    const awaitingLinkMeetings = meetings.filter(
        meeting => meeting.status === "approved_waiting_link"
    );

    const scheduledMeetings = meetings.filter(
        meeting => meeting.status === "scheduled"
    );

    const completedMeetings = meetings.filter(
        meeting => meeting.status === "completed"
    );

    const cancelledMeetings = meetings.filter(
        meeting => meeting.status === "cancelled"
    );







    const handleSaveCalendar =
        async (
            e: React.FormEvent
        ) => {


            e.preventDefault();


            if (!user)
                return;



            if (
                !calForm.proposalStartDate ||
                !calForm.proposalDueDate ||
                !calForm.reviewDueDate
            )
                return;



            setCalSaving(true);



            await saveAcademicCalendar(
                calForm,
                user.uid
            );



            setCalSaving(false);

            setCalSaved(true);

            setCalOpen(false);



            setTimeout(
                () => setCalSaved(false),
                3000
            );


        };









    const quickActions = [

        {
            title:
                "User Management",

            description:
                "View and manage students, supervisors and administrators.",

            gradient:
                "from-amber-500 to-yellow-500",

            path:
                "/admin/users",

            label:
                "Manage Users"
        },



        {
            title:
                "Proposal Management",

            description:
                "Review and manage all research proposals submitted in the system.",

            gradient:
                "from-amber-600 to-amber-500",

            path:
                "/admin/proposals",

            label:
                "View Proposals"
        },



        {
            title:
                "Supervisor Assignment",

            description:
                "Assign students to available supervisors.",

            gradient:
                "from-orange-500 to-orange-600",

            path:
                "/admin/assignments",

            label:
                "Assign Supervisors"
        },



        {
            title:
                "Meetings Management",

            description:
                "Monitor scheduled, completed and cancelled supervision meetings.",

            gradient:
                "from-blue-500 to-indigo-600",

            path:
                "/admin/meetings",

            label:
                "Manage Meetings"
        },



        {
            title:
                "AI Insights",

            description:
                "Analyze workflow performance and generate intelligent insights.",

            gradient:
                "from-purple-500 to-pink-500",

            path:
                "/admin/ai-analytics",

            label:
                "View AI Insights"
        },



        {
            title:
                "Reports & Analytics",

            description:
                "View academic progress reports and system analytics.",

            gradient:
                "from-emerald-500 to-green-600",

            path:
                "/admin/reports",

            label:
                "View Reports"
        }


    ];
    return (

        <DashboardLayout>

            <div className="space-y-8">


                {/* HEADER */}

                <div className="flex items-start justify-between gap-4 flex-wrap">

                    <div>

                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">

                            Admin Dashboard

                        </h1>


                        <p className="text-slate-400 text-sm font-medium mt-1">

                            System-wide overview — manage users, proposals, supervision meetings and academic workflows.

                        </p>


                    </div>



                    {
                        calSaved && (

                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl">

                                ✓ Calendar saved!

                            </div>

                        )
                    }


                </div>








                {/* ACADEMIC PROGRESS */}

                {
                    !calLoading && (

                        <AcademicProgressBar
                            calendar={calendar}
                            role="admin"
                        />

                    )
                }








                {/* CALENDAR SETTINGS */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">


                    <button

                        onClick={() =>
                            setCalOpen(!calOpen)
                        }

                        className="w-full p-5 flex justify-between items-center"

                    >

                        <div>

                            <p className="font-bold text-slate-800">

                                Academic Calendar Settings

                            </p>


                            <p className="text-xs text-slate-400">

                                Manage proposal submission and review dates

                            </p>


                        </div>


                        <span>

                            {calOpen ? "▲" : "▼"}

                        </span>


                    </button>






                    {
                        calOpen && (


                            <form

                                onSubmit={handleSaveCalendar}

                                className="border-t p-5 space-y-4"

                            >


                                <div className="grid md:grid-cols-3 gap-4">


                                    <input

                                        type="date"

                                        value={
                                            calForm.proposalStartDate
                                        }

                                        onChange={
                                            e =>
                                                setCalForm({
                                                    ...calForm,
                                                    proposalStartDate:
                                                        e.target.value
                                                })
                                        }

                                        className="border rounded-xl p-3"

                                    />



                                    <input

                                        type="date"

                                        value={
                                            calForm.proposalDueDate
                                        }

                                        onChange={
                                            e =>
                                                setCalForm({
                                                    ...calForm,
                                                    proposalDueDate:
                                                        e.target.value
                                                })
                                        }

                                        className="border rounded-xl p-3"

                                    />



                                    <input

                                        type="date"

                                        value={
                                            calForm.reviewDueDate
                                        }

                                        onChange={
                                            e =>
                                                setCalForm({
                                                    ...calForm,
                                                    reviewDueDate:
                                                        e.target.value
                                                })
                                        }

                                        className="border rounded-xl p-3"

                                    />


                                </div>





                                <button

                                    disabled={calSaving}

                                    className="bg-amber-500 text-white px-5 py-2 rounded-xl font-bold"

                                >

                                    {
                                        calSaving
                                            ? "Saving..."
                                            : "Save Calendar"
                                    }


                                </button>



                            </form>


                        )
                    }


                </div>









                {/* SUMMARY CARDS */}


                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">


                    {[
                        ["Total Users", users.length],
                        ["Students", students.length],
                        ["Supervisors", supervisors.length],
                        ["Total Proposals", proposals.length],
                        ["Total Meetings", meetings.length],
                        ["Pending Meetings", pendingMeetings.length],
                        ["Awaiting Links", awaitingLinkMeetings.length],
                        ["Upcoming Meetings", scheduledMeetings.length],
                        ["Completed Meetings", completedMeetings.length],
                        ["Cancelled Meetings", cancelledMeetings.length]
                    ]

                        .map(([label, value]) => (


                            <div

                                key={label}

                                className="bg-white border rounded-2xl p-5 shadow-sm"

                            >


                                <p className="text-xs text-slate-400 font-bold uppercase">

                                    {label}

                                </p>


                                <p className="text-3xl font-black text-slate-800 mt-2">

                                    {value}

                                </p>


                            </div>


                        ))

                    }


                </div>









                {/* QUICK STATS */}


                <div className="grid md:grid-cols-2 gap-5">


                    <div className="bg-white border rounded-2xl p-5">


                        <p className="text-xs font-bold text-slate-400 uppercase">

                            Pending Reviews

                        </p>


                        <p className="text-3xl font-black text-amber-500">

                            {pending.length}

                        </p>


                    </div>





                    <div className="bg-white border rounded-2xl p-5">


                        <p className="text-xs font-bold text-slate-400 uppercase">

                            Approved Proposals

                        </p>


                        <p className="text-3xl font-black text-emerald-500">

                            {approved.length}

                        </p>


                    </div>


                </div>









                {/* QUICK ACTIONS */}


                <div>


                    <h2 className="font-bold text-slate-700 mb-4">

                        Quick Actions

                    </h2>



                    <div className="grid md:grid-cols-2 gap-5">


                        {
                            quickActions.map(action => (


                                <div

                                    key={action.path}

                                    onClick={() =>
                                        navigate(action.path)
                                    }

                                    className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition"

                                >


                                    <div

                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}

                                    />



                                    <h3 className="font-bold text-slate-800">

                                        {action.title}

                                    </h3>



                                    <p className="text-sm text-slate-400">

                                        {action.description}

                                    </p>



                                    <p className="mt-4 text-sm font-bold text-amber-600">

                                        {action.label} →

                                    </p>


                                </div>


                            ))
                        }


                    </div>


                </div>





            </div>


        </DashboardLayout>


    );


}