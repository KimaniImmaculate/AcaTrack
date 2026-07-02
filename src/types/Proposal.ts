/**
 * Represents a research proposal.
 *
 * Every proposal submitted by a student
 * follows this structure.
 */
export interface Proposal {
    /**
     * Firestore document ID.
     */
    id: string;

    /**
     * Research title.
     */
    title: string;

    /**
     * Proposal abstract.
     */
    abstract: string;

    /**
     * Research problem statement.
     */
    problemStatement: string;

    /**
     * Research objectives.
     */
    objectives: string;

    /**
     * Proposed research methodology.
     */
    methodology: string;

    /**
     * Expected outcomes.
     */
    expectedOutcome: string;

    /**
     * Department responsible.
     */
    department: string;

    /**
     * Student who owns this proposal.
     */
    studentId: string;

    /**
     * Assigned supervisor.
     *
     * Null until assigned.
     */
    supervisorId: string | null;

    /**
     * Link to uploaded proposal document.
     */
    documentURL: string;

    /**
     * Proposal version.
     * Increases after every resubmission.
     */
    version: number;

    /**
     * Current workflow status.
     */
    status:
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "approved"
    | "rejected";

    /**
     * Creation timestamp.
     */
    createdAt: Date;

    /**
     * Last update timestamp.
     */
    updatedAt: Date;
}