import { RevisionCompliance } from "../types";

export async function getRevisionCompliance(
    proposalId: string
): Promise<RevisionCompliance> {

    return {

        score: 88,

        recommendation:
            "The proposal addresses most requested revisions and is ready for supervisor review.",

        checks: [

            {
                request: "Improve Methodology",
                result: "completed",
                comment: "Methodology has been significantly expanded."
            },

            {
                request: "Expand Literature Review",
                result: "completed",
                comment: "Three additional literature sections detected."
            },

            {
                request: "Add More References",
                result: "partial",
                comment: "References increased from 12 to 16."
            },

            {
                request: "Update Objectives",
                result: "missing",
                comment: "Objectives are unchanged from the previous version."
            }

        ]

    };

}