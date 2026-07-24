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
                <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Proposal Quality Assistant
                </h2>
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
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Proposal Quality Card
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Automated structural & methodology evaluation</p>
                    {quality.source === "gemini" ? (
                        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Gemini AI
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Smart Heuristic
                        </span>
                    )}
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
                    <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.238a5.002 5.002 0 01-.065-.08H12" />
                        </svg>
                        Key Recommendations
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
