import { AIInsight } from "../../types/AI";

export async function getWorkflowInsight(): Promise<AIInsight> {

    return {

        title: "Workflow Intelligence",

        message:
            "Average review time is 8 days. Two proposals may exceed the expected review period.",

        confidence: 88,

        recommendation:
            "Consider reminding supervisors with overdue proposals."

    };

}