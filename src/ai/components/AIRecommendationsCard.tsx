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

            <h2 className="text-xl font-bold mb-5">

                💡 AI Recommendations

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