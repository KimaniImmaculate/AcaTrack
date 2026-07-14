import { useEffect, useState } from "react";

import { getRevisionCompliance } from "../services/revisionCompliance";

import {
    RevisionCompliance,
    ComplianceCheck,
} from "../types";

interface Props {
    proposalId: string;
}

export default function RevisionComplianceCard({
    proposalId,
}: Props) {

    const [analysis, setAnalysis] =
        useState<RevisionCompliance | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function load() {

            const result =
                await getRevisionCompliance(proposalId);

            setAnalysis(result);

            setLoading(false);

        }

        load();

    }, [proposalId]);

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-6 mt-8">

                Loading AI Revision Compliance...

            </div>

        );

    }

    if (!analysis) return null;

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-8">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">

                    AI Revision Compliance Assistant

                </h2>

                <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">

                    Preview

                </span>

            </div>


            <div className="mb-6">

                <p className="text-gray-600">

                    Compliance Score

                </p>

                <div className="flex items-center gap-3 mt-2">

                    <div className="text-4xl font-bold text-indigo-600">

                        {analysis.score}%

                    </div>

                    <div className="flex-1 bg-gray-200 rounded-full h-3">

                        <div

                            className="bg-indigo-600 h-3 rounded-full"

                            style={{

                                width: `${analysis.score}%`

                            }}

                        />

                    </div>

                </div>

            </div>


            <div className="space-y-4">

                {analysis.checks.map(

                    (check: ComplianceCheck, index: number) => (

                        <div

                            key={index}

                            className={`border-l-4 rounded p-4

                            ${check.result === "completed"

                                    ? "border-green-500 bg-green-50"

                                    : check.result === "partial"

                                        ? "border-yellow-500 bg-yellow-50"

                                        : "border-red-500 bg-red-50"

                                }`}

                        >

                            <h3 className="font-semibold">

                                {

                                    check.result === "completed"

                                        ? "✅"

                                        : check.result === "partial"

                                            ? "⚠️"

                                            : "❌"

                                }

                                {" "}

                                {check.request}

                            </h3>

                            <p className="text-gray-700 mt-1">

                                {check.comment}

                            </p>

                        </div>

                    )

                )}

            </div>


            <div className="mt-8 border-t pt-5">

                <h3 className="font-semibold mb-2">

                    AI Recommendation

                </h3>

                <p className="text-gray-700">

                    {analysis.recommendation}

                </p>

            </div>

        </div>

    );

}