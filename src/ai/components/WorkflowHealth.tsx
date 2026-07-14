import { useEffect, useState } from "react";

import { getWorkflowHealth } from "../services/workflowHealth";

import { WorkflowHealth } from "../types";

export default function WorkflowHealthCard() {

    const [health, setHealth] =
        useState<WorkflowHealth | null>(null);

    useEffect(() => {

        async function load() {

            const result =
                await getWorkflowHealth();

            setHealth(result);

        }

        load();

    }, []);

    if (!health) {

        return (

            <div className="bg-white rounded-xl shadow p-6">

                Loading...

            </div>

        );

    }

    return (

        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-5">

                🟢 Workflow Health

            </h2>

            <div className="space-y-4">

                <div>

                    <p className="text-gray-500">

                        Overall Health

                    </p>

                    <p className="text-4xl font-bold text-green-600">

                        {health.overallHealth}%

                    </p>

                </div>

                <hr />

                <div>

                    <p className="font-semibold">

                        Average Review Time

                    </p>

                    <p>

                        {health.averageReviewTime} days

                    </p>

                </div>

                <div>

                    <p className="font-semibold">

                        Average Approval Time

                    </p>

                    <p>

                        {health.averageApprovalTime} days

                    </p>

                </div>

                <div>

                    <p className="font-semibold">

                        Revision Rate

                    </p>

                    <p>

                        {health.revisionRate}%

                    </p>

                </div>

                <hr />

                <div>

                    <p className="font-semibold">

                        Status

                    </p>

                    <p className="text-gray-600">

                        {health.status}

                    </p>

                </div>

            </div>

        </div>

    );

}