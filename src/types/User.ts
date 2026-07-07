import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    id: string;

    firstName: string;
    lastName: string;

    email: string;

    role: "student" | "supervisor" | "admin";

    department: string;

    // Student only
    admissionNumber?: string;

    // Supervisor only
    staffNumber?: string;

    createdAt: Timestamp;
}