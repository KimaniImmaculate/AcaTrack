import { AIRecommendation } from "../types";

export async function getAIRecommendations(): Promise<AIRecommendation[]> {

    return [

        {

            title: "Send Reminder",

            description:

                "Notify supervisors with proposals under review for more than 14 days."

        },

        {

            title: "Assign Supervisors",

            description:

                "Three proposals are awaiting supervisor assignment."

        },

        {

            title: "Review Workload",

            description:

                "Redistribute proposals from overloaded supervisors."

        },

        {

            title: "Student Follow-up",

            description:

                "Five students have not responded to revision requests."

        }

    ];

}