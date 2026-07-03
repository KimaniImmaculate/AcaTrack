export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "student" | "supervisor" | "admin";
    department: string;

    /**
     * Date the account was created.
     */
    createdAt: Date;
}