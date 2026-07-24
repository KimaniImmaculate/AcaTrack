import { useEffect, useState } from "react";

import { getReviewAssistant } from "../services/reviewAssistant";

import { ReviewAssistant } from "../types";

interface Props {
    proposalId: string;
}

export default function ReviewAssistantCard({
    proposalId,
}: Props) {

    const [review, setReview] =
        useState<ReviewAssistant | null>(null);

    useEffect(() => {

        async function load() {

            const result =
                await getReviewAssistant(proposalId);

            setReview(result);

        }

        load();

    }, [proposalId]);

    if (!review) {

        return (

            <div className="bg-white rounded-xl shadow p-6">

                Loading Review Assistant...

            </div>

        );

    }

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-8">

            <div className="flex justify-between items-start mb-6">

                <div>

                    <h2 className="text-2xl font-bold">

                        Review Assistant

                    </h2>

                    <p className="text-gray-500 mt-1">

                        Intelligent summary of the student's latest revision.

                    </p>

                    {review.source === "gemini" ? (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            🤖 Gemini AI
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            ⚙ Smart Heuristic
                        </span>
                    )}

                </div>

                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">

                    Preview

                </span>

            </div>

            {/* Score */}

            <div className="mb-8">

                <div className="flex justify-between mb-2">

                    <span className="font-semibold">

                        Revision Score

                    </span>

                    <span className="font-bold text-lg">

                        {review.score}%

                    </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                    <div

                        className="bg-green-600 h-3 rounded-full"

                        style={{
                            width: `${review.score}%`
                        }}

                    />

                </div>

            </div>

            {/* Summary */}

            <div className="mb-8">

                <h3 className="font-semibold text-lg mb-2">

                    Summary

                </h3>

                <p className="text-gray-700">

                    {review.summary}

                </p>

            </div>

            {/* Changes */}

            <div className="mb-8">

                <h3 className="font-semibold text-lg mb-4">

                    Changes Detected

                </h3>

                <div className="space-y-3">

                    {review.changes.map((change, index) => (

                        <div

                            key={index}

                            className="flex justify-between bg-gray-50 rounded-lg p-3"

                        >

                            <span>

                                {change.section}

                            </span>

                            <span className="font-medium">

                                {change.change}

                            </span>

                        </div>

                    ))}

                </div>

            </div>

            {/* Compliance */}

            <div className="mb-8">

                <h3 className="font-semibold text-lg mb-4">

                    Revision Review

                </h3>

                <div className="space-y-4">

                    {review.checks.map((check, index) => (

                        <div

                            key={index}

                            className="border rounded-lg p-4"

                        >

                            <div className="flex justify-between">

                                <span className="font-semibold">

                                    {check.title}

                                </span>

                                <span>

                                    {check.status === "completed" && "🟢"}

                                    {check.status === "partial" && "🟡"}

                                    {check.status === "missing" && "🔴"}

                                </span>

                            </div>

                            <p className="text-gray-600 mt-2">

                                {check.comment}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Recommendation */}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

                <h3 className="font-semibold mb-2">

                    Recommendation

                </h3>

                <p>

                    {review.recommendation}

                </p>

            </div>

        </div>

    );

}