import { RevisionInsight } from "../../types/AI";

export async function analyzeRevision(): Promise<RevisionInsight> {

    return {

        changedSections: [

            "Abstract",

            "Methodology"

        ],

        unchangedSections: [

            "Problem Statement"

        ],

        summary:
            "Most requested changes were addressed. Consider revising the problem statement."

    };

}