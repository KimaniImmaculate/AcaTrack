import { ProposalQualityResult } from "../types";

const GEMINI_MODEL = "gemini-1.5-flash";

export async function callGeminiAPI(prompt: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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
            console.warn(`Gemini API returned HTTP status ${response.status}`);
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
