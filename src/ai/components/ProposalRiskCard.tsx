import { useEffect, useState } from "react";

import { getProposalRisks } from "../services/proposalRisk";

import { ProposalRisk } from "../types";

export default function ProposalRiskCard() {

    const [risks, setRisks] = useState<ProposalRisk[]>([]);

    useEffect(() => {

        async function load() {

            const result = await getProposalRisks();

            setRisks(result);

        }

        load();

    }, []);

    return (

        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-5">

                🚨 Proposal Risk Monitor

            </h2>

            <div className="space-y-5">

                {risks.map((risk, index) => (

                    <div
                        key={index}
                        className="border rounded-lg p-4"
                    >

                        <div className="flex justify-between">

                            <h3 className="font-semibold">

                                {risk.title}

                            </h3>

                            <span className="font-bold text-red-600">

                                {risk.riskScore}%

                            </span>

                        </div>

                        <ul className="list-disc ml-6 mt-3 text-sm text-gray-600">

                            {risk.reasons.map((reason, i) => (

                                <li key={i}>

                                    {reason}

                                </li>

                            ))}

                        </ul>

                        <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">

                            <p className="font-medium">

                                Recommendation

                            </p>

                            <p className="text-sm">

                                {risk.recommendation}

                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}