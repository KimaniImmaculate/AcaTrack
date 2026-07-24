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
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Gemini AI
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Smart Heuristic
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

                                <span className="flex items-center gap-1">
                                    {check.status === "completed" && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs" title="Completed" />
                                    )}
                                    {check.status === "partial" && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" title="Partial" />
                                    )}
                                    {check.status === "missing" && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs" title="Missing" />
                                    )}
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