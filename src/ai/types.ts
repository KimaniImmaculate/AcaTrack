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
   REVISION COMPLIANCE
=========================== */

export interface ComplianceCheck {

    request: string;

    result: "completed" | "partial" | "missing";

    comment: string;

}

export interface RevisionCompliance {

    score: number;

    recommendation: string;

    checks: ComplianceCheck[];

}