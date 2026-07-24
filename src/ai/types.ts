/* ===========================
   WORKFLOW HEALTH
=========================== */

export interface WorkflowHealth {

    overallHealth: number;

    averageReviewTime: number;

    averageApprovalTime: number;

    revisionRate: number;

    status: string;

}


/* ===========================
   PROPOSAL RISK
=========================== */

export interface ProposalRisk {

    title: string;

    riskScore: number;

    reasons: string[];

    recommendation: string;

}


/* ===========================
   DEADLINE FORECAST
=========================== */

export interface DeadlineForecast {

    deadline: string;

    predictedCompletion: string;

    confidence: number;

    recommendation: string;

}


/* ===========================
   AI RECOMMENDATIONS
=========================== */

export interface AIRecommendation {

    title: string;

    description: string;

}

/* ===========================
   REVIEW ASSISTANT
=========================== */

export interface ReviewCheck {

    title: string;

    status: "completed" | "partial" | "missing";

    comment: string;

}

export interface ChangeSummary {

    section: string;

    change: string;

}

export interface ReviewAssistant {

    score: number;

    summary: string;

    recommendation: string;

    changes: ChangeSummary[];

    checks: ReviewCheck[];

    source: "gemini" | "heuristic";

}

/* ===========================
   PROGRESS COACH
=========================== */

export interface ProgressCoach {

    progress: number;

    currentStage: string;

    estimatedCompletion: string;

    nextMilestone: string;

    motivation: string;

    suggestions: string[];

    source: "gemini" | "heuristic";

}

/* ===========================
   PROPOSAL QUALITY
=========================== */

export interface SectionQuality {

    name: string;

    status: "Good" | "Needs Work" | "Missing";

    score: number;

    feedback: string;

}

export interface ProposalQualityResult {

    overallScore: number;

    status: "Excellent" | "Good" | "Needs Improvement" | "Critical Issues";

    sections: SectionQuality[];

    suggestions: string[];

    strengths: string[];

    source: "gemini" | "heuristic";

}