import {
    addDoc,
    collection,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";
import { createNotification } from "./notifications";
import { createActivity } from "./activityService";


export interface MeetingRequest {

    studentId: string;
    supervisorId: string;
    proposalId: string;

    title: string;
    agenda: string;

    requestedDate: string;
    requestedTime: string;

    duration: string;
    mode: "online" | "physical";

    status:
    | "pending"
    | "approved_waiting_link"
    | "scheduled"
    | "completed"
    | "cancelled"
    | "declined";
    createdAt?: any;

}



// STUDENT CREATES REQUEST

export async function createMeetingRequest(
    data: MeetingRequest,
    studentName: string
) {


    const meetingRef = await addDoc(
        collection(db, "meetingRequests"),
        {
            ...data,

            status: "pending",

            createdAt: serverTimestamp()
        }
    );



    await createNotification(

        data.supervisorId,

        data.proposalId,

        "New Meeting Request",

        `${studentName} requested a supervision meeting on ${data.requestedDate} at ${data.requestedTime}`,

        "meeting_request"

    );



    await createActivity(

        data.proposalId,

        `Student requested a meeting with supervisor for ${data.requestedDate} at ${data.requestedTime}`,

        {
            uid: data.studentId,
            name: studentName,
            role: "student"
        }

    );


    return meetingRef.id;

}





// SUPERVISOR ACCEPTS REQUEST

export async function acceptMeetingRequest(
    requestId: string,
    requestData: any,
    supervisorName: string
) {

    await updateDoc(
        doc(db, "meetingRequests", requestId),
        {
            status: "approved_waiting_link",
            updatedAt: serverTimestamp()
        }
    );


    await createNotification(
        requestData.studentId,
        requestData.proposalId,
        "Meeting Approved",
        "Your supervisor approved the meeting request. Please add the meeting link.",
        "meeting_approved"
    );


    await createActivity(
        requestData.proposalId,
        "Supervisor approved the meeting request. Waiting for meeting link.",
        {
            uid: requestData.supervisorId,
            name: supervisorName,
            role: "supervisor"
        }
    );

}





// STUDENT ADDS MEETING LINK

export async function addMeetingLink(
    meetingRequestId: string,
    meetingData: any,
    link: string,
    studentName: string
) {


    await updateDoc(
        doc(
            db,
            "meetingRequests",
            meetingRequestId
        ),
        {

            meetingLink: link,

            status: "scheduled",

            updatedAt: serverTimestamp()

        }
    );


    await createNotification(
        meetingData.supervisorId,
        meetingData.proposalId,
        "Meeting Link Added",
        `${studentName} added the meeting link.\n\n${link}`,
        "meeting_link_added"
    );


    await createActivity(
        meetingData.proposalId,
        "Student added the meeting link. Meeting is now scheduled.",
        {
            uid: meetingData.studentId,
            name: studentName,
            role: "student"
        }
    );

}





// SUPERVISOR DECLINES

export async function declineMeetingRequest(

    requestId: string,

    requestData: any,

    reason: string,

    supervisorName: string

) {


    await updateDoc(

        doc(
            db,
            "meetingRequests",
            requestId
        ),

        {

            status: "declined",

            declineReason: reason,

            updatedAt: serverTimestamp()

        }

    );





    await createNotification(

        requestData.studentId,

        requestData.proposalId,

        "Meeting Declined",

        `Your supervisor declined the meeting request. Reason: ${reason}`,

        "meeting_declined"

    );





    await createActivity(

        requestData.proposalId,

        `Supervisor declined meeting request. Reason: ${reason}`,

        {

            uid: requestData.supervisorId,

            name: supervisorName,

            role: "supervisor"

        }

    );

}

export async function completeMeeting(
    meetingId: string,
    meetingData: any,
    supervisorName: string
) {

    await updateDoc(
        doc(db, "meetingRequests", meetingId),
        {
            completedBy,
            status: "completed",
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );


    await createNotification(
        meetingData.studentId,
        meetingData.proposalId,
        "Meeting Completed",
        "Your supervision meeting has been marked as completed.",
        "meeting_completed"
    );


    await createActivity(
        meetingData.proposalId,
        "Supervisor marked the meeting as completed.",
        {
            uid: meetingData.supervisorId,
            name: supervisorName,
            role: "supervisor"
        }
    );

}