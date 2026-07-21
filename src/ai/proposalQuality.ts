import { ProposalQualityResult, SectionQuality } from "./types";
import { Proposal } from "../types/Proposal";

export async function analyzeProposalQuality(
    proposal: Partial<Proposal> | {
        title?: string;
        abstract?: string;
        problemStatement?: string;
        objectives?: string;
        methodology?: string;
        expectedOutcome?: string;
        documentURL?: string;
    }
): Promise<ProposalQualityResult> {
    const {
        title = "",
        abstract = "",
        problemStatement = "",
        objectives = "",
        methodology = "",
        expectedOutcome = "",
        documentURL = ""
    } = proposal;

    const sections: SectionQuality[] = [];
    const suggestions: string[] = [];
    const strengths: string[] = [];

    // 1. Title Evaluation
    const titleWords = title.trim().split(/\s+/).filter(Boolean);
    let titleScore = 100;
    let titleFeedback = "Title is well-formatted and descriptive.";
    let titleStatus: "Good" | "Needs Work" | "Missing" = "Good";

    if (!title.trim()) {
        titleScore = 0;
        titleStatus = "Missing";
        titleFeedback = "Title is missing. A strong research title is required.";
        suggestions.push("Add a concise, descriptive title defining your research scope.");
    } else if (titleWords.length < 5) {
        titleScore = 50;
        titleStatus = "Needs Work";
        titleFeedback = "Title is too short. It should clearly summarize the core research focus.";
        suggestions.push("Expand your title to include your specific methodology or application domain.");
    } else if (titleWords.length > 25) {
        titleScore = 70;
        titleStatus = "Needs Work";
        titleFeedback = "Title is overly verbose. Aim for conciseness (10-20 words).";
        suggestions.push("Simplify your title by eliminating unnecessary filler words.");
    } else {
        strengths.push("Clear and focused research title.");
    }
    sections.push({ name: "Title & Scope", status: titleStatus, score: titleScore, feedback: titleFeedback });

    // 2. Abstract Evaluation
    const abstractWords = abstract.trim().split(/\s+/).filter(Boolean);
    let abstractScore = 100;
    let abstractFeedback = "Abstract provides a solid overview of the research.";
    let abstractStatus: "Good" | "Needs Work" | "Missing" = "Good";

    if (!abstract.trim()) {
        abstractScore = 0;
        abstractStatus = "Missing";
        abstractFeedback = "Abstract is missing.";
        suggestions.push("Write a 150–300 word abstract summarizing background, objective, and proposed impact.");
    } else if (abstractWords.length < 50) {
        abstractScore = 55;
        abstractStatus = "Needs Work";
        abstractFeedback = `Abstract is too brief (${abstractWords.length} words). Standard length is 150-300 words.`;
        suggestions.push("Expand the abstract to include motivation, methodology preview, and expected contributions.");
    } else {
        strengths.push(`Comprehensive abstract (${abstractWords.length} words).`);
    }
    sections.push({ name: "Abstract", status: abstractStatus, score: abstractScore, feedback: abstractFeedback });

    // 3. Problem Statement & Objectives
    const probText = (problemStatement + " " + objectives).trim();
    const probWords = probText.split(/\s+/).filter(Boolean);
    let probScore = 100;
    let probFeedback = "Problem statement and research objectives are clearly articulated.";
    let probStatus: "Good" | "Needs Work" | "Missing" = "Good";

    if (!probText) {
        probScore = 0;
        probStatus = "Missing";
        probFeedback = "Problem statement and objectives are missing.";
        suggestions.push("Detail the core problem being solved and list 3-5 measurable objectives.");
    } else if (probWords.length < 40) {
        probScore = 60;
        probStatus = "Needs Work";
        probFeedback = "Problem statement and objectives lack technical depth.";
        suggestions.push("Break down research goals into specific primary and secondary objectives.");
    } else {
        strengths.push("Well-defined problem statement and objective alignment.");
    }
    sections.push({ name: "Problem Statement & Objectives", status: probStatus, score: probScore, feedback: probFeedback });

    // 4. Methodology
    const methWords = methodology.trim().split(/\s+/).filter(Boolean);
    let methScore = 100;
    let methFeedback = "Methodology section details experimental/system design thoroughly.";
    let methStatus: "Good" | "Needs Work" | "Missing" = "Good";

    if (!methodology.trim()) {
        methScore = 0;
        methStatus = "Missing";
        methFeedback = "Methodology section is missing.";
        suggestions.push("Describe your research design, tools, datasets, and validation metrics.");
    } else if (methWords.length < 50) {
        methScore = 60;
        methStatus = "Needs Work";
        methFeedback = "Methodology is light on technical implementation details.";
        suggestions.push("Include specific algorithms, framework choices, and evaluation metrics in methodology.");
    } else {
        strengths.push("Detailed methodology with clear execution steps.");
    }
    sections.push({ name: "Methodology", status: methStatus, score: methScore, feedback: methFeedback });

    // 5. Document & Attachment Check
    let docScore = documentURL ? 100 : 70;
    let docFeedback = documentURL ? "Primary research proposal document attached." : "No PDF/DOCX document uploaded yet.";
    let docStatus: "Good" | "Needs Work" | "Missing" = documentURL ? "Good" : "Needs Work";
    if (!documentURL) {
        suggestions.push("Attach your full PDF/DOCX proposal document for supervisor downloading and annotation.");
    } else {
        strengths.push("Proposal manuscript uploaded and accessible.");
    }
    sections.push({ name: "Document Attachment", status: docStatus, score: docScore, feedback: docFeedback });

    // Overall Score Calculation
    const overallScore = Math.round(
        sections.reduce((sum, sec) => sum + sec.score, 0) / sections.length
    );

    let status: "Excellent" | "Good" | "Needs Improvement" | "Critical Issues" = "Good";
    if (overallScore >= 85) status = "Excellent";
    else if (overallScore >= 70) status = "Good";
    else if (overallScore >= 50) status = "Needs Improvement";
    else status = "Critical Issues";

    return {
        overallScore,
        status,
        sections,
        suggestions,
        strengths
    };
}
