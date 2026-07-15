import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    doc,
    getDoc
} from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import ActivityTimeline from "../../components/ActivityTimeline";

export default function AdminMeetingDetail() {

    const { id } = useParams();

    const [meeting, setMeeting] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [supervisor, setSupervisor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadMeeting() {

            if (!id) return;

            const meetingRef = doc(
                db,
                "meetingRequests",
                id
            );

            const meetingSnap = await getDoc(meetingRef);

            if (!meetingSnap.exists()) {
                setLoading(false);
                return;
            }

            const meetingData = {
                id: meetingSnap.id,
                ...(meetingSnap.data() as any)
            };

            setMeeting(meetingData);

            const studentSnap = await getDoc(
                doc(db, "users", meetingData.studentId)
            );

            if (studentSnap.exists()) {
                setStudent(studentSnap.data());
            }

            const supervisorSnap = await getDoc(
                doc(db, "users", meetingData.supervisorId)
            );

            if (supervisorSnap.exists()) {
                setSupervisor(supervisorSnap.data());
            }

            setLoading(false);
        }

        loadMeeting();

    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    Loading meeting...
                </div>
            </DashboardLayout>
        );
    }

    if (!meeting) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    Meeting not found.
                </div>
            </DashboardLayout>
        );
    }

    return (

        <DashboardLayout>

            <div className="max-w-6xl mx-auto space-y-8">

                <div>

                    <h1 className="text-3xl font-black text-slate-800">
                        Meeting Details
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Complete information about this supervision meeting.
                    </p>

                </div>

                {/* Meeting Information */}

                <div className="bg-white rounded-2xl border shadow-sm p-6">

                    <h2 className="font-bold text-lg mb-5">
                        Meeting Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                        <Info
                            label="Title"
                            value={meeting.title}
                        />

                        <Info
                            label="Agenda"
                            value={meeting.agenda}
                        />

                        <Info
                            label="Date"
                            value={meeting.requestedDate}
                        />

                        <Info
                            label="Time"
                            value={meeting.requestedTime}
                        />

                        <Info
                            label="Duration"
                            value={meeting.duration}
                        />

                        <Info
                            label="Mode"
                            value={meeting.mode}
                        />

                        <Info
                            label="Status"
                            value={meeting.status}
                        />

                    </div>

                </div>

                {/* Participants */}

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="bg-white rounded-2xl border shadow-sm p-6">

                        <h2 className="font-bold text-lg mb-4">
                            Student
                        </h2>

                        <Info
                            label="Name"
                            value={`${student?.firstName ?? ""} ${student?.lastName ?? ""}`}
                        />

                        <Info
                            label="Email"
                            value={student?.email}
                        />

                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm p-6">

                        <h2 className="font-bold text-lg mb-4">
                            Supervisor
                        </h2>

                        <Info
                            label="Name"
                            value={`${supervisor?.firstName ?? ""} ${supervisor?.lastName ?? ""}`}
                        />

                        <Info
                            label="Email"
                            value={supervisor?.email}
                        />

                    </div>

                </div>

                {/* Meeting Link */}

                {meeting.meetingLink && (

                    <div className="bg-white rounded-2xl border shadow-sm p-6">

                        <h2 className="font-bold mb-4">
                            Meeting Link
                        </h2>

                        <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {meeting.meetingLink}
                        </a>

                    </div>

                )}

                {/* Cancellation */}

                {meeting.status === "cancelled" && (

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                        <h2 className="font-bold text-red-700 mb-3">
                            Cancellation
                        </h2>

                        <p>
                            {meeting.cancelReason || "No reason provided"}
                        </p>

                    </div>

                )}

                <div className="bg-white border rounded-2xl p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-slate-800 mb-5">
                        Meeting Audit Information
                    </h2>

                    <div className="space-y-4">

                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold text-slate-500">
                                Created On
                            </span>

                            <span>
                                {meeting.createdAt
                                    ? new Date(
                                        meeting.createdAt.seconds * 1000
                                    ).toLocaleString()
                                    : "-"}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold text-slate-500">
                                Last Updated
                            </span>

                            <span>
                                {meeting.updatedAt
                                    ? new Date(
                                        meeting.updatedAt.seconds * 1000
                                    ).toLocaleString()
                                    : "-"}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold text-slate-500">
                                Completed On
                            </span>

                            <span>
                                {meeting.completedAt
                                    ? new Date(
                                        meeting.completedAt.seconds * 1000
                                    ).toLocaleString()
                                    : "-"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">
                                Completed By
                            </span>

                            <span>
                                {meeting.completedBy || "-"}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Timeline */}

                <ActivityTimeline
                    proposalId={meeting.proposalId}
                />

            </div>

        </DashboardLayout>

    );

}

function Info({
    label,
    value
}: {
    label: string;
    value: any;
}) {

    return (

        <div>

            <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
                {label}
            </p>

            <p className="mt-1 font-medium text-slate-700">
                {value || "-"}
            </p>

        </div>

    );

}