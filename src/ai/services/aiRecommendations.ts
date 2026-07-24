import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { AIRecommendation } from "../types";
import { generateAIRecommendationsWithGemini } from "./geminiService";

export async function getAIRecommendations(): Promise<AIRecommendation[]> {
    try {
        const querySnapshot = await getDocs(collection(db, "proposals"));
        let unassignedCount = 0;
        let overdueReviewCount = 0;
        let awaitingResubmissionCount = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.supervisorId && data.status !== "draft") unassignedCount++;
            if (data.status === "under_review") overdueReviewCount++;
            if (data.status === "revision_requested") awaitingResubmissionCount++;
        });

        try {
            const geminiResult = await generateAIRecommendationsWithGemini({
                unassignedCount,
                overdueReviewCount,
                awaitingResubmissionCount
            });
            if (geminiResult) {
                return geminiResult;
            }
        } catch (geminiErr) {
            console.warn("Gemini AI Recommendations failed, using fallback:", geminiErr);
        }

        const recs: AIRecommendation[] = [];

        if (unassignedCount > 0) {
            recs.push({
                title: "Assign Unassigned Proposals",
                description: `${unassignedCount} proposal(s) are awaiting faculty supervisor assignment.`
            });
        }

        if (overdueReviewCount > 0) {
            recs.push({
                title: "Send Review Reminders",
                description: `${overdueReviewCount} proposal(s) currently under review could benefit from supervisor reminder alerts.`
            });
        }

        if (awaitingResubmissionCount > 0) {
            recs.push({
                title: "Follow Up with Students",
                description: `${awaitingResubmissionCount} student(s) have pending revision requests.`
            });
        }

        recs.push({
            title: "Optimize Supervisor Workload Balance",
            description: "Monitor supervisor proposal allocations to prevent review delays."
        });

        if (recs.length > 0) return recs;
    } catch (err) {
        console.warn("Firestore fallback for AI Recommendations:", err);
    }

    return [
        {
            title: "Send Supervisor Reminders",
            description: "Notify supervisors with proposals under review for more than 7 days."
        },
        {
            title: "Assign Pending Proposals",
            description: "Two new proposals are awaiting supervisor assignment."
        },
        {
            title: "Review Workload Distribution",
            description: "Redistribute proposals from overloaded faculty members."
        },
        {
            title: "Student Follow-up",
            description: "Send automated alerts to students with pending revisions."
        }
    ];
}