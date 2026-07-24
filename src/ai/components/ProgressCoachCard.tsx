import { useEffect, useState } from "react";

import { getProgressCoach } from "../services/progressCoach";

import { ProgressCoach } from "../types";

interface Props {
    status?: string;
}

export default function ProgressCoachCard({ status }: Props) {

    const [coach, setCoach] =
        useState<ProgressCoach | null>(null);

    useEffect(() => {

        async function load() {

            const result =
                await getProgressCoach(status);

            setCoach(result);

        }

        load();

    }, [status]);


    if (!coach) {

        return (

            <div className="bg-white rounded-xl shadow p-6">

                Loading Progress Coach...

            </div>

        );

    }

    return (

        <div className="bg-white rounded-xl shadow p-6 mb-8">

            <div className="flex justify-between items-start">

                <div>

                    <h2 className="text-2xl font-bold">

                        Progress Coach

                    </h2>

                    <p className="text-gray-500 mt-1">

                        Smart insights to help you stay on track.

                    </p>

                    {coach.source === "gemini" ? (
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

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                    Smart Insights

                </span>

            </div>

            <div className="mt-8">

                <div className="flex justify-between">

                    <span>

                        Overall Progress

                    </span>

                    <span className="font-bold">

                        {coach.progress}%

                    </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

                    <div

                        className="bg-green-600 h-3 rounded-full"

                        style={{
                            width: `${coach.progress}%`
                        }}

                    />

                </div>

            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>

                    <h3 className="font-semibold">

                        Current Stage

                    </h3>

                    <p className="text-gray-700">

                        {coach.currentStage}

                    </p>

                </div>

                <div>

                    <h3 className="font-semibold">

                        Estimated Completion

                    </h3>

                    <p className="text-gray-700">

                        {coach.estimatedCompletion}

                    </p>

                </div>

                <div>

                    <h3 className="font-semibold">

                        Next Milestone

                    </h3>

                    <p className="text-gray-700">

                        {coach.nextMilestone}

                    </p>

                </div>

                <div>

                    <h3 className="font-semibold">

                        Encouragement

                    </h3>

                    <p className="text-gray-700">

                        {coach.motivation}

                    </p>

                </div>

            </div>

            <div className="mt-8">

                <h3 className="font-semibold mb-3">

                    Suggestions

                </h3>

                <ul className="space-y-2">

                    {coach.suggestions.map((item, index) => (

                        <li
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 flex items-start gap-2"
                        >
                            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.238a5.002 5.002 0 01-.065-.08H12" />
                            </svg>
                            <span>{item}</span>
                        </li>

                    ))}

                </ul>

            </div>

        </div>

    );

}