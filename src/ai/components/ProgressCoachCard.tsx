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
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            🤖 Gemini AI
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            ⚙ Smart Heuristic
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
                            className="bg-gray-50 rounded-lg p-3"
                        >

                            💡 {item}

                        </li>

                    ))}

                </ul>

            </div>

        </div>

    );

}