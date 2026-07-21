import { useEffect, useState } from "react";
import { analyzeProposalQuality } from "./proposalQuality";
import { ProposalQualityResult } from "./types";
import { Proposal } from "../types/Proposal";

interface ProposalQualityCardProps {
    proposal?: Partial<Proposal>;
}

export default function ProposalQualityCard({ proposal }: ProposalQualityCardProps) {
    const [quality, setQuality] = useState<ProposalQualityResult | null>(null);

    useEffect(() => {
        async function runAnalysis() {
            if (proposal) {
                const res = await analyzeProposalQuality(proposal);
                setQuality(res);
            }
        }
        runAnalysis();
    }, [proposal]);

    if (!proposal || !quality) {
        return (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-2 text-gray-800">✨ AI Proposal Quality Assistant</h2>
                <p className="text-sm text-gray-500">Select or edit a proposal to view AI quality insights.</p>
            </div>
        );
    }

    const getScoreBadgeColor = (score: number) => {
        if (score >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-300";
        if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-300";
        if (score >= 50) return "bg-amber-100 text-amber-800 border-amber-300";
        return "bg-rose-100 text-rose-800 border-rose-300";
    };

    const getStatusBadge = (status: "Good" | "Needs Work" | "Missing") => {
        if (status === "Good") return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700">Good</span>;
        if (status === "Needs Work") return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700">Needs Work</span>;
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-700">Missing</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        ✨ AI Proposal Quality Card
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Automated structural & methodology evaluation</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border font-bold text-lg ${getScoreBadgeColor(quality.overallScore)}`}>
                    {quality.overallScore} / 100
                </div>
            </div>

            {/* Status Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality Rating</div>
                <div className="text-lg font-bold text-gray-800 mt-0.5">{quality.status}</div>
            </div>

            {/* Sections Evaluation */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Section Breakdown</h3>
                <div className="space-y-2">
                    {quality.sections.map((sec, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-gray-800">{sec.name}</span>
                                {getStatusBadge(sec.status)}
                            </div>
                            <p className="text-xs text-gray-600">{sec.feedback}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actionable Suggestions */}
            {quality.suggestions.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1">
                        💡 Key Recommendations
                    </h3>
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-gray-700">
                        {quality.suggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
