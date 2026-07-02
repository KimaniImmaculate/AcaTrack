/**
 * Represents a user in the AcaTrack system.
 *
 * This interface mirrors the document stored in:
 * Firestore -> users collection
 */
export interface UserProfile {
    /**
     * Firebase Authentication UID.
     * This uniquely identifies the user.
     */
    uid: string;

    /**
     * User's full name.
     */
    name: string;

    /**
     * User's email address.
     */
    email: string;

    /**
     * Determines what the user is allowed to do.
     */
    role: "student" | "supervisor" | "admin";

    /**
     * Academic department.
     * Example:
     * Computer Science
     * Information Technology
     */
    department: string;

    /**
     * Date the account was created.
     */
    createdAt: Date;
}