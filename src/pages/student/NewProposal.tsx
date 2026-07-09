import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useSupervisors } from "../../hooks/useSupervisors";
import { uploadProposalDocument } from "../../services/storageService";
import DashboardLayout from "../../layouts/DashboardLayout";

const inputClass =
    "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 resize-none";

const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function NewProposal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { supervisors } = useSupervisors();

    const [title,           setTitle]           = useState("");
    const [abstract,        setAbstract]        = useState("");
    const [problemStatement,setProblemStatement] = useState("");
    const [objectives,      setObjectives]      = useState("");
    const [methodology,     setMethodology]     = useState("");
    const [expectedOutcome, setExpectedOutcome] = useState("");
    const [department,      setDepartment]      = useState("");
    const [supervisorId,    setSupervisorId]    = useState("");

    const [file,    setFile]    = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            let docUrl = "";
            if (file) {
                docUrl = await uploadProposalDocument(user.uid, file);
            }

            await addDoc(collection(db, "proposals"), {
                title,
                abstract,
                problemStatement,
                objectives,
                methodology,
                expectedOutcome,
                department,
                studentId:    user.uid,
                supervisorId: supervisorId || null,
                documentURL:  docUrl,
                version:      1,
                status:       "draft",
                createdAt:    serverTimestamp(),
                updatedAt:    serverTimestamp(),
            });

            navigate("/student/proposals");
        } catch (err) {
            console.error("Error saving draft:", err);
            setError("Failed to save proposal. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fields: {
        id: string;
        label: string;
        hint: string;
        placeholder: string;
        value: string;
        setter: (v: string) => void;
    }[] = [
        {
            id: "abstract",
            label: "Abstract",
            hint: "2–4 sentence summary of your research",
            placeholder: "Briefly describe what this research is about and what it aims to achieve…",
            value: abstract,
            setter: setAbstract,
        },
        {
            id: "problemStatement",
            label: "Problem Statement",
            hint: "The core issue or gap this research addresses",
            placeholder: "State the problem being investigated and why it matters…",
            value: problemStatement,
            setter: setProblemStatement,
        },
        {
            id: "objectives",
            label: "Research Objectives",
            hint: "Key goals (a short bullet list is fine)",
            placeholder: "e.g. To identify… To design… To evaluate…",
            value: objectives,
            setter: setObjectives,
        },
        {
            id: "methodology",
            label: "Methodology",
            hint: "Approach / methods you plan to use",
            placeholder: "e.g. Quantitative study using surveys, Python-based analysis…",
            value: methodology,
            setter: setMethodology,
        },
        {
            id: "expectedOutcome",
            label: "Expected Outcome",
            hint: "What result or deliverable will this produce?",
            placeholder: "e.g. A working system, a set of recommendations, a dataset…",
            value: expectedOutcome,
            setter: setExpectedOutcome,
        },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">
                        New Research Proposal
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Fill in brief summaries below, then attach your full proposal document.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Section 1: Basic Info ── */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                            Basic Information
                        </h2>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className={labelClass}>
                                Proposal Title <span className="text-rose-400">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                className={inputClass}
                                placeholder="e.g. Applying Machine Learning to Detect Academic Plagiarism"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Department */}
                            <div>
                                <label htmlFor="department" className={labelClass}>
                                    Department <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    id="department"
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. Computer Science"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Preferred Supervisor */}
                            <div>
                                <label htmlFor="supervisor" className={labelClass}>
                                    Preferred Supervisor
                                    <span className="ml-1 text-slate-300 normal-case font-normal">(optional)</span>
                                </label>
                                <select
                                    id="supervisor"
                                    className={`${inputClass} bg-white`}
                                    value={supervisorId}
                                    onChange={e => setSupervisorId(e.target.value)}
                                >
                                    <option value="">— Admin will assign one —</option>
                                    {supervisors.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.prefix ? `${s.prefix} ` : ""}{s.firstName} {s.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Proposal Summaries ── */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                            Proposal Summaries
                            <span className="ml-2 font-normal normal-case text-slate-300">
                                — brief overviews only; attach full details in your document below
                            </span>
                        </h2>

                        {fields.map(f => (
                            <div key={f.id}>
                                <label htmlFor={f.id} className={labelClass}>
                                    {f.label} <span className="text-rose-400">*</span>
                                    <span className="ml-1.5 text-slate-300 normal-case font-normal">
                                        — {f.hint}
                                    </span>
                                </label>
                                <textarea
                                    id={f.id}
                                    className={inputClass}
                                    rows={2}
                                    placeholder={f.placeholder}
                                    value={f.value}
                                    onChange={e => f.setter(e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    {/* ── Section 3: Document Upload ── */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                            Full Proposal Document
                        </h2>

                        <label
                            htmlFor="docUpload"
                            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                                file
                                    ? "border-amber-400 bg-amber-50/30"
                                    : "border-slate-200 hover:border-amber-400 hover:bg-amber-50/20"
                            }`}
                        >
                            <div className="flex flex-col items-center justify-center gap-2">
                                {file ? (
                                    <>
                                        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-xs font-bold text-amber-700">{file.name}</p>
                                        <p className="text-[10px] text-amber-500 font-medium">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-xs font-bold text-slate-600">
                                            Click or drag to upload your proposal document
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            PDF, DOC, DOCX — up to 10 MB
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                id="docUpload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>

                        <p className="text-[10px] text-slate-400 font-medium">
                            You can also save as a draft now and attach the document later from Proposal Details.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold p-3.5 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
                        >
                            {loading ? "Saving Draft…" : "Save as Draft"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/student/proposals")}
                            className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 font-semibold text-sm transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}