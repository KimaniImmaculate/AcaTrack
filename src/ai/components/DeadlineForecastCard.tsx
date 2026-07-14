import { useEffect, useState } from "react";

import { getDeadlineForecast } from "../services/deadlineForecast";

import { DeadlineForecast } from "../types";

export default function DeadlineForecastCard() {

    const [forecast, setForecast] =
        useState<DeadlineForecast | null>(null);

    useEffect(() => {

        async function load() {

            const result =
                await getDeadlineForecast();

            setForecast(result);

        }

        load();

    }, []);

    if (!forecast) {

        return (

            <div className="bg-white rounded-xl shadow p-6">

                Loading...

            </div>

        );

    }

    return (

        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-5">

                📅 Smart Deadline Forecast

            </h2>

            <div className="space-y-4">

                <div>

                    <p className="text-gray-500">

                        Academic Deadline

                    </p>

                    <p className="font-semibold">

                        {forecast.deadline}

                    </p>

                </div>

                <div>

                    <p className="text-gray-500">

                        Predicted Completion

                    </p>

                    <p className="font-semibold text-green-600">

                        {forecast.predictedCompletion}

                    </p>

                </div>

                <div>

                    <p className="text-gray-500">

                        Confidence

                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

                        <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{
                                width: `${forecast.confidence}%`
                            }}
                        />

                    </div>

                    <p className="mt-1 font-semibold">

                        {forecast.confidence}%

                    </p>

                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">

                    <p className="font-semibold">

                        Recommendation

                    </p>

                    <p>

                        {forecast.recommendation}

                    </p>

                </div>

            </div>

        </div>

    );

}