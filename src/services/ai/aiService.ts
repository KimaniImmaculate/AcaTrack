import { AIInsight } from "../../types/AI";

export async function generateInsight(): Promise<AIInsight> {
    return {
        title: "AI Insight",
        message:
            "Workflow appears healthy. No major bottlenecks detected.",
        confidence: 92,
        recommendation:
            "Continue monitoring supervisor workload."
    };
}