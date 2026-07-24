import { ProgressCoach } from "../types";

export async function getProgressCoach(status?: string): Promise<ProgressCoach> {
    const s = (status || "").toLowerCase();

    if (s === "approved") {
        return {
            progress: 100,
            currentStage: "Proposal Approved",
            estimatedCompletion: "Completed",
            nextMilestone: "Commence Primary Research Phase",
            motivation: "Congratulations! Your proposal has passed departmental review.",
            suggestions: [
                "Schedule a kickoff meeting with your supervisor.",
                "Export your activity timeline report for your thesis defense file.",
                "Begin data collection & methodology execution."
            ],
            source: "heuristic" as const
        };
    }

    if (s === "revision_requested") {
        return {
            progress: 60,
            currentStage: "Revision Requested",
            estimatedCompletion: "Awaiting Resubmission",
            nextMilestone: "Resubmit Updated Proposal Draft",
            motivation: "Revisions are a normal part of academic research. Focus on addressing supervisor remarks.",
            suggestions: [
                "Check the Supervisor Remarks in the Proposal Detail view.",
                "Update your problem statement and methodology according to feedback.",
                "Resubmit before the academic calendar due date."
            ],
            source: "heuristic" as const
        };
    }

    if (s === "under_review" || s === "submitted") {
        return {
            progress: 75,
            currentStage: "Under Faculty Review",
            estimatedCompletion: "Within 3-5 days",
            nextMilestone: "Supervisor Review Completion",
            motivation: "Great progress! Your proposal is currently being evaluated by your supervisor.",
            suggestions: [
                "Keep checking your in-app notifications.",
                "Prepare preliminary research slides.",
                "Schedule a follow-up supervision meeting if needed."
            ],
            source: "heuristic" as const
        };
    }

    // Default / Draft
    return {
        progress: 25,
        currentStage: "Drafting Proposal",
        estimatedCompletion: "Awaiting Submission",
        nextMilestone: "Submit Draft for Supervisor Review",
        motivation: "Start strong! Use the AI Proposal Quality Card to refine your manuscript.",
        suggestions: [
            "Ensure your abstract is between 150 and 300 words.",
            "Clearly define 3 to 5 core research objectives.",
            "Attach your complete PDF/DOCX proposal file."
        ],
        source: "heuristic" as const
    };
}