import { ProposalQualityResult } from "../types";

const GEMINI_MODEL = "gemini-flash-latest";

/**
 * Calls the Gemini API matching Google AI Studio's official cURL specification:
 * Header: X-goog-api-key: <KEY>
 */
export async function callGeminiAPI(prompt: string): Promise<string | null> {
    const credential = import.meta.env.VITE_GEMINI_API_KEY;
    if (!credential) {
        console.warn("VITE_GEMINI_API_KEY is not set.");
        return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-goog-api-key": credential,
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.warn(`Gemini API returned HTTP ${response.status}:`, errBody);
            return null;
        }

        const data = await response.json();
        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return textResponse || null;
    } catch (err) {
        console.warn("Gemini API call failed, falling back to heuristic engine:", err);
        return null;
    }
}

export async function analyzeProposalWithGemini(proposal: {
    title?: string;
    abstract?: string;
    problemStatement?: string;
    objectives?: string;
    methodology?: string;
    expectedOutcome?: string;
}): Promise<ProposalQualityResult | null> {
    const prompt = `
You are an expert academic research reviewer. Analyze the following university research proposal draft and evaluate its quality.

PROPOSAL DRAFT:
- Title: ${proposal.title || "None provided"}
- Abstract: ${proposal.abstract || "None provided"}
- Problem Statement: ${proposal.problemStatement || "None provided"}
- Objectives: ${proposal.objectives || "None provided"}
- Methodology: ${proposal.methodology || "None provided"}
- Expected Outcome: ${proposal.expectedOutcome || "None provided"}

Respond ONLY with a valid JSON object matching this exact JSON schema:
{
  "overallScore": number (0-100),
  "status": "Excellent" | "Good" | "Needs Improvement" | "Critical Issues",
  "sections": [
    {
      "name": "Title & Scope" | "Abstract" | "Problem Statement & Objectives" | "Methodology" | "Document Attachment",
      "status": "Good" | "Needs Work" | "Missing",
      "score": number (0-100),
      "feedback": "specific 1-2 sentence constructive critique"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "strengths": ["strength 1", "strength 2"]
}
`;

    const rawResult = await callGeminiAPI(prompt);
    if (!rawResult) return null;

    try {
        const parsed = JSON.parse(rawResult) as ProposalQualityResult;
        if (typeof parsed.overallScore === "number" && Array.isArray(parsed.sections)) {
            return parsed;
        }
    } catch (err) {
        console.warn("Failed to parse Gemini JSON response:", err);
    }

    return null;
}

export async function analyzeReviewWithGemini(
    proposal: {
        title?: string;
        abstract?: string;
        problemStatement?: string;
        objectives?: string;
        methodology?: string;
        expectedOutcome?: string;
        version?: number;
        status?: string;
    },
    comments: {
        authorRole: string;
        authorName: string;
        text: string;
    }[]
): Promise<import("../types").ReviewAssistant | null> {
    const formattedComments = comments
        .map(c => `- [${c.authorRole}] ${c.authorName}: ${c.text}`)
        .join("\n");

    const prompt = `
You are an expert academic research reviewer. Analyze the following university research proposal draft and its revision/comment history, then evaluate the status of the revision.

PROPOSAL DRAFT (Version ${proposal.version || 1}, Status: ${proposal.status || "draft"}):
- Title: ${proposal.title || "None provided"}
- Abstract: ${proposal.abstract || "None provided"}
- Problem Statement: ${proposal.problemStatement || "None provided"}
- Objectives: ${proposal.objectives || "None provided"}
- Methodology: ${proposal.methodology || "None provided"}
- Expected Outcome: ${proposal.expectedOutcome || "None provided"}

REVISION & COMMENT HISTORY:
${formattedComments || "No comment history yet."}

Respond ONLY with a valid JSON object matching this exact JSON schema:
{
  "score": number (0-100 indicating the current draft's readiness / quality),
  "summary": "specific 1-2 sentence overview of the current status of the proposal review",
  "recommendation": "actionable 1-2 sentence recommendation for the supervisor",
  "changes": [
    {
      "section": "section name (e.g. Abstract, Methodology, etc.)",
      "change": "description of the change detected, improved content, or actions taken"
    }
  ],
  "checks": [
    {
      "title": "check name (e.g. 'Methodology Soundness', 'Abstract Clarity', 'Objectives Realism', 'Literature review')",
      "status": "completed" | "partial" | "missing",
      "comment": "brief justification or advice for this check"
    }
  ]
}
`;

    const rawResult = await callGeminiAPI(prompt);
    if (!rawResult) return null;

    try {
        const parsed = JSON.parse(rawResult) as import("../types").ReviewAssistant;
        if (typeof parsed.score === "number" && Array.isArray(parsed.changes) && Array.isArray(parsed.checks)) {
            return parsed;
        }
    } catch (err) {
        console.warn("Failed to parse Gemini JSON response for review assistant:", err);
    }
    return null;
}

export async function generateDeadlineForecastWithGemini(
    deadlineDate: string,
    stats: {
        total: number;
        approved: number;
        revision: number;
        underReview: number;
        draft: number;
    }
): Promise<import("../types").DeadlineForecast | null> {
    const prompt = `
You are an institutional academic director. Forecast the likelihood of all student research proposals being successfully finalized before the academic calendar deadline of ${deadlineDate}.

CURRENT SYSTEM STATS:
- Total Proposals: ${stats.total}
- Approved: ${stats.approved}
- Under Review / Submitted: ${stats.underReview}
- Revision Requested / Resubmitted: ${stats.revision}
- Draft: ${stats.draft}

Respond ONLY with a valid JSON object matching this exact JSON schema:
{
  "deadline": "${deadlineDate}",
  "predictedCompletion": "specific predicted date based on statistics (e.g. '28 August 2026')",
  "confidence": number (0-100 indicating confidence in completing all reviews on time),
  "recommendation": "1-2 sentence actionable recommendation or insight regarding review velocity"
}
`;

    const rawResult = await callGeminiAPI(prompt);
    if (!rawResult) return null;

    try {
        const parsed = JSON.parse(rawResult) as import("../types").DeadlineForecast;
        if (parsed.deadline && parsed.predictedCompletion && typeof parsed.confidence === "number") {
            return parsed;
        }
    } catch (err) {
        console.warn("Failed to parse Gemini JSON response for deadline forecast:", err);
    }
    return null;
}

export async function generateAIRecommendationsWithGemini(
    issues: {
        unassignedCount: number;
        overdueReviewCount: number;
        awaitingResubmissionCount: number;
    }
): Promise<import("../types").AIRecommendation[] | null> {
    const prompt = `
You are an academic operations advisor. Analyze these current academic proposal workflow issues and generate a list of actionable operational recommendations for administrators.

WORKFLOW ISSUES:
- Proposals Awaiting Supervisor Assignment: ${issues.unassignedCount}
- Reviews Overdue (> 7 days in review): ${issues.overdueReviewCount}
- Revisions Overdue (> 10 days awaiting student resubmission): ${issues.awaitingResubmissionCount}

Respond ONLY with a valid JSON array of objects matching this exact JSON schema:
[
  {
    "title": "short active recommendation title",
    "description": "detailed actionable description of what the administration or faculty should do"
  }
]
`;

    const rawResult = await callGeminiAPI(prompt);
    if (!rawResult) return null;

    try {
        const parsed = JSON.parse(rawResult) as import("../types").AIRecommendation[];
        if (Array.isArray(parsed) && parsed.every(item => item.title && item.description)) {
            return parsed;
        }
    } catch (err) {
        console.warn("Failed to parse Gemini JSON response for AI recommendations:", err);
    }
    return null;
}
