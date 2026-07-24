import { useState } from "react";
import {
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import FormAlert from "../../components/FormAlert";
import { useAuth } from "../../contexts/AuthContext";
import { useSupervisors } from "../../hooks/useSupervisors";
import { useDepartments } from "../../hooks/useDepartments";
import { useAcademicCalendar } from "../../hooks/useAcademicCalendar";
import { uploadProposalDocument } from "../../services/storageService";
import DashboardLayout from "../../layouts/DashboardLayout";

const inputClass =
    "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 resize-none";

const selectClass =
    "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 bg-white appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat cursor-pointer";

const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function NewProposal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { supervisors } = useSupervisors();
    const { departments } = useDepartments();
    const { calendar, loading: calLoading } = useAcademicCalendar();

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [problemStatement, setProblemStatement] = useState("");
    const [objectives, setObjectives] = useState("");
    const [methodology, setMethodology] = useState("");
    const [expectedOutcome, setExpectedOutcome] = useState("");
    const [department, setDepartment] = useState("");
    const [supervisorId, setSupervisorId] = useState("");

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
                studentId: user.uid,
                supervisorId: supervisorId || null,
                documentURL: docUrl,
                version: 1,
                status: "draft",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
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




    const todayStr = new Date().toISOString().split("T")[0];
    const isClosed = calendar && todayStr > calendar.proposalDueDate;

    if (!calLoading && isClosed) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Proposal Submission Closed</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            The deadline for submitting new research proposals was <span className="font-semibold text-slate-700">{new Date(calendar.proposalDueDate).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                        </p>
                        <p className="text-xs text-slate-400">
                            If you already have a proposal that requires revision, you can resubmit it directly from the Proposal Details page.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => navigate("/student/proposals")}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                Back to My Proposals
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

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

                        <div>
                            <label htmlFor="department" className={labelClass}>
                                Department <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="department"
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-3 pr-10 text-sm text-slate-800 outline-none transition-all bg-white appearance-none cursor-pointer"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">— Select Department —</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 20 20">
                                        <path d="M7 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Preferred Supervisor */}
                        <div>
                            <label htmlFor="supervisor" className={labelClass}>
                                Preferred Supervisor
                                <span className="ml-1 text-slate-300 normal-case font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="supervisor"
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-3 pr-10 text-sm text-slate-800 outline-none transition-all bg-white appearance-none cursor-pointer"
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
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 20 20">
                                        <path d="M7 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
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
                            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${file
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
                    <FormAlert message={error} />

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