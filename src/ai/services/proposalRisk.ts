import { ProposalRisk } from "../types";

export async function getProposalRisks(): Promise<ProposalRisk[]> {

    return [

        {

            title: "AI in Healthcare",

            riskScore: 94,

            reasons: [

                "No supervisor assigned",

                "Review overdue",

                "Student inactive for 16 days"

            ],

            recommendation:

                "Assign a supervisor immediately."

        },

        {

            title: "Blockchain Voting",

            riskScore: 61,

            reasons: [

                "Revision requested",

                "Awaiting student resubmission"

            ],

            recommendation:

                "Send reminder to student."

        }

    ];

}