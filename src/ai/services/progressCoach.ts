import { ProgressCoach } from "../types";

export async function getProgressCoach(): Promise<ProgressCoach> {

    return {

        progress: 72,

        currentStage: "Proposal Under Review",

        estimatedCompletion: "Within 3 days",

        nextMilestone:
            "Supervisor feedback expected.",

        motivation:
            "Great progress! You're almost at the review completion stage.",

        suggestions: [

            "Keep checking your notifications.",

            "Prepare supporting documents while waiting.",

            "Start planning your presentation slides.",

            "Review previous supervisor comments."

        ]

    };

}