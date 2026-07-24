import { useEffect, useState } from "react";

import { getAIRecommendations } from "../services/aiRecommendations";

import { AIRecommendation } from "../types";

export default function AIRecommendationsCard() {

    const [recommendations, setRecommendations] =
        useState<AIRecommendation[]>([]);

    useEffect(() => {

        async function load() {

            const result =
                await getAIRecommendations();

            setRecommendations(result);

        }

        load();

    }, []);

    return (

        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.238a5.002 5.002 0 01-.065-.08H12" />
                </svg>
                AI Recommendations
            </h2>

            <div className="space-y-4">

                {recommendations.map((item, index) => (

                    <div
                        key={index}
                        className="border rounded-lg p-4 bg-indigo-50"
                    >

                        <h3 className="font-semibold">

                            {item.title}

                        </h3>

                        <p className="text-sm text-gray-700 mt-1">

                            {item.description}

                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}