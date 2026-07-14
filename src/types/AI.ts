export interface AIInsight {
    title: string;
    message: string;
    confidence: number;
    recommendation?: string;
}

export interface RevisionInsight {
    changedSections: string[];
    unchangedSections: string[];
    summary: string;
}

export interface DeadlinePrediction {
    estimatedCompletion: string;
    confidence: number;
    risk: "Low" | "Medium" | "High";
    recommendation: string;
}