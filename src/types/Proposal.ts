/**
 * Represents a research proposal.
 */
export interface Proposal {
    id: string;
    title: string;
    abstract: string;

    problemStatement: string;
    objectives: string;
    methodology: string;
    expectedOutcome: string;
    department: string;

    studentId: string;
    supervisorId: string | null;

    documentURL: string;
    version: number;

    status:
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "approved"
    | "rejected";

    createdAt: any;   // Firestore Timestamp
    updatedAt: any;   // Firestore Timestamp
}