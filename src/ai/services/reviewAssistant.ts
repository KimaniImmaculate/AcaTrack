import { ReviewAssistant } from "../types";

export async function getReviewAssistant(
    proposalId: string
): Promise<ReviewAssistant> {

    return {

        score: 88,

        summary:
            "The revised proposal addresses most requested revisions and is substantially improved.",

        recommendation:
            "Ready for supervisor review. Consider updating the objectives before final approval.",

        changes: [

            {
                section: "Abstract",
                change: "+42% expanded"
            },

            {
                section: "Methodology",
                change: "Updated with two additional sections"
            },

            {
                section: "References",
                change: "+4 references"
            },

            {
                section: "Objectives",
                change: "No significant changes"
            }

        ],

        checks: [

            {

                title: "Improve Methodology",

                status: "completed",

                comment:
                    "Methodology has been significantly expanded."

            },

            {

                title: "Expand Literature Review",

                status: "completed",

                comment:
                    "Three additional literature sections detected."

            },

            {

                title: "Add More References",

                status: "partial",

                comment:
                    "References increased from 12 to 16."

            },

            {

                title: "Update Objectives",

                status: "missing",

                comment:
                    "Objectives remain unchanged."

            }

        ]

    };

}