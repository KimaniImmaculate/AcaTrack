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
    | "resubmitted"
    | "approved"
    | "rejected";

    createdAt: any;
    updatedAt: any;
}