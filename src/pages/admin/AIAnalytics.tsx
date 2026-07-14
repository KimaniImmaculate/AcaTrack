import DashboardLayout from "../../layouts/DashboardLayout";

import WorkflowHealthCard from "../../ai/components/WorkflowHealth";
import ProposalRiskCard from "../../ai/components/ProposalRiskCard";
import DeadlineForecastCard from "../../ai/components/DeadlineForecastCard";
import AIRecommendationsCard from "../../ai/components/AIRecommendationsCard";

export default function AIInsights() {

    return (

        <DashboardLayout>

            <div className="max-w-7xl mx-auto p-6">

                <h1 className="text-3xl font-bold mb-8">

                    AI Insights

                </h1>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <WorkflowHealthCard />

                    <DeadlineForecastCard />

                    <ProposalRiskCard />

                    <AIRecommendationsCard />

                </div>

            </div>

        </DashboardLayout>

    );

}