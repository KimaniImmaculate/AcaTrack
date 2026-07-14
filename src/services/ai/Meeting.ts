import { Timestamp } from "firebase/firestore";

export interface Meeting {
    id: string;
    studentId: string;
    studentName: string;
    supervisorId: string;
    supervisorName: string;
    proposalId: string;
    proposalTitle: string;
    requesterId: string;

    proposedDate: Timestamp;
    status: "pending" | "confirmed" | "declined" | "completed";
    meetingLink?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}