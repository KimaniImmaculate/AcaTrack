import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    id: string;

    prefix?: string;      // e.g. "Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Eng."
    firstName: string;
    lastName: string;

    email: string;

    role: "student" | "supervisor" | "admin";

    department: string;
    school?: string;

    // Student only
    admissionNumber?: string;

    // Supervisor only
    staffNumber?: string;

    photoURL?: string;

    createdAt: Timestamp;
}