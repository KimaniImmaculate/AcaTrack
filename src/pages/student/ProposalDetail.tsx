import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import { UserProfile } from "../../types/User";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { submitProposal, resubmitProposal } from "../../services/proposalWorkflow";
import { uploadProposalDocument } from "../../services/storageService";
import DashboardLayout from "../../layouts/DashboardLayout";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";

export default function ProposalDetail() {
    const { user, profile } = useAuth();
    const { id } = useParams();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [supervisor, setSupervisor] = useState<UserProfile | null | "not_found">(null);
    const [file, setFile] = useState<File | null>(null);
    const [responseText, setResponseText] = useState("");
    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        title: "",
        abstract: "",
        problemStatement: "",
        objectives: "",
        methodology: "",
        expectedOutcome: "",
        department: ""
    });

    useEffect(() => {
        if (!id) return;

        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snap) => {
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as Proposal;
                    setProposal(data);
                    setForm({
                        title: data.title,
                        abstract: data.abstract,
                        problemStatement: data.problemStatement,
                        objectives: data.objectives,
                        methodology: data.methodology,
                        expectedOutcome: data.expectedOutcome,
                        department: data.department
                    });
                } else {
                    setProposal(null);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const sid = proposal?.supervisorId;
        if (!sid) {
            setSupervisor(null);
            return;
        }

        getDoc(doc(db, "users", sid))
            .then((snap) => {
                if (snap.exists()) {
                    setSupervisor({ id: snap.id, ...snap.data() } as UserProfile);
                } else {
                    setSupervisor("not_found");
                }
            })
            .catch(() => setSupervisor("not_found"));
    }, [proposal?.supervisorId]);

    const saveChanges = async () => {
        if (!proposal) return;
        setLoading(true);

        try {
            let docUrl = proposal.documentURL || "";
            if (file) {
                docUrl = await uploadProposalDocument(proposal.studentId, file);
            }

            await updateDoc(
                doc(db, "proposals", proposal.id),
                {
                    ...form,
                    documentURL: docUrl,
                    updatedAt: serverTimestamp()
                }
            );

            setEditing(false);
            setFile(null);
        } catch (error) {
            console.error("Error saving proposal changes:", error);
            alert("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">
                    Loading proposal details...
                </div>
            </DashboardLayout>
        );
    }

    if (!proposal) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">
                    Proposal not found.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    {editing ? (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Edit Proposal Title
                            </label>
                            <input
                                className="border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 w-full text-lg font-extrabold text-slate-850 outline-none transition-all"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                    ) : (
                        <h1 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight leading-snug">
                            {proposal.title}
                        </h1>
                    )}

                    <div className="flex items-center justify-between gap-4 flex-wrap border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-3">
                            <StatusBadge status={proposal.status} />
                        </div>
                        {proposal.updatedAt?.toDate && (
                            <span className="text-xs text-slate-400 font-medium">
                                Last updated:{" "}
                                {proposal.updatedAt.toDate().toLocaleDateString("en-US", {
                                    day: "numeric", month: "long", year: "numeric"
                                })}{" "}
                                •{" "}
                                {proposal.updatedAt.toDate().toLocaleTimeString("en-US", {
                                    hour: "numeric", minute: "2-digit"
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Supervisor & Document Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supervisor Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Assigned Supervisor
                        </h3>
                        <div className="text-sm space-y-1">
                            {proposal.supervisorId ? (
                                supervisor === null ? (
                                    <p className="text-slate-400">Loading supervisor details...</p>
                                ) : supervisor === "not_found" ? (
                                    <p className="text-slate-500 font-semibold">Details not found</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        <p className="text-slate-800 font-bold">
                                            {supervisor.firstName} {supervisor.lastName}
                                        </p>
                                        <p className="text-slate-500 text-xs font-medium">
                                            {supervisor.department || "General Department"}
                                        </p>
                                    </div>
                                )
                            ) : (
                                <p className="text-slate-400 font-semibold">No supervisor assigned yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Document Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Proposal Document
                            </h3>
                            <div className="text-sm mt-1.5">
                                {proposal.documentURL ? (
                                    <a
                                        href={proposal.documentURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold hover:underline gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Current Draft Document
                                    </a>
                                ) : (
                                    <p className="text-slate-400 font-semibold">No document attached yet.</p>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="border border-dashed border-slate-200 hover:border-amber-500 rounded-xl p-3 bg-slate-50/50 mt-3 transition-colors">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Replace Attachment File
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Workflow Actions Controls */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Workflow & Submission Status
                    </h3>

                    <div className="flex gap-3 flex-wrap">
                        {(proposal.status === "draft" || proposal.status === "revision_requested") && !editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                            >
                                Edit Text & Document
                            </button>
                        )}

                        {editing && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={saveChanges}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                               >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setFile(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 font-bold text-xs px-4 py-2.5"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {proposal.status === "draft" && !editing && (
                            <button
                                onClick={() => {
                                    if (!user) return;
                                    submitProposal(proposal, {
                                        uid: user.uid,
                                        name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Student",
                                        role: "student"
                                    });
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                            >
                                Submit for Review
                            </button>
                        )}
                    </div>

                    {/* Resubmit comments block */}
                    {proposal.status === "revision_requested" && (
                        <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                            <div className="bg-amber-50/30 border border-amber-100/80 rounded-xl p-4 space-y-3">
                                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                                    Explain how you resolved the comments
                                </label>
                                <textarea
                                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all placeholder:text-slate-350"
                                    rows={3}
                                    placeholder="Write a brief explanation of the modifications made (e.g. Expanded Section 3)..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                />
                                <button
                                    onClick={async () => {
                                        if (!user) return;
                                        setLoading(true);
                                        try {
                                            await resubmitProposal(
                                                proposal,
                                                {
                                                    uid: user.uid,
                                                    name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Student",
                                                    role: "student"
                                                },
                                                responseText
                                            );
                                            setResponseText("");
                                        } catch (error) {
                                            console.error("Resubmit error:", error);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-block"
                                >
                                    Resubmit with Resolved Comments
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form fields Details */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">
                        Proposal Specifications
                    </h3>

                    <div className="space-y-6">
                        <EditableField
                            label="Department"
                            editing={editing}
                            value={form.department}
                            display={proposal.department}
                            onChange={(v) => setForm({ ...form, department: v })}
                        />

                        <EditableField
                            label="Abstract (Summary)"
                            editing={editing}
                            value={form.abstract}
                            display={proposal.abstract}
                            onChange={(v) => setForm({ ...form, abstract: v })}
                        />

                        <EditableField
                            label="Problem Statement"
                            editing={editing}
                            value={form.problemStatement}
                            display={proposal.problemStatement}
                            onChange={(v) => setForm({ ...form, problemStatement: v })}
                        />

                        <EditableField
                            label="Objectives"
                            editing={editing}
                            value={form.objectives}
                            display={proposal.objectives}
                            onChange={(v) => setForm({ ...form, objectives: v })}
                        />

                        <EditableField
                            label="Methodology"
                            editing={editing}
                            value={form.methodology}
                            display={proposal.methodology}
                            onChange={(v) => setForm({ ...form, methodology: v })}
                        />

                        <EditableField
                            label="Expected Outcome"
                            editing={editing}
                            value={form.expectedOutcome}
                            display={proposal.expectedOutcome}
                            onChange={(v) => setForm({ ...form, expectedOutcome: v })}
                        />

                        <Field
                            label="Document Version"
                            value={`v${proposal.version}`}
                        />
                    </div>
                </div>

                {/* Comments & Activity Log Timelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CommentsList proposalId={proposal.id} />
                    <ActivityTimeline proposalId={proposal.id} />
                </div>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {label}
            </span>
            <p className="text-slate-800 text-sm font-semibold">{value}</p>
        </div>
    );
}

function EditableField({
    label,
    editing,
    value,
    display,
    onChange
}: {
    label: string;
    editing: boolean;
    value: string;
    display: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {label}
            </span>
            {editing ? (
                <textarea
                    className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl p-3 text-sm text-slate-850 outline-none transition-all"
                    rows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 border border-slate-100 rounded-xl p-4 whitespace-pre-line">
                    {display || "Not specified"}
                </p>
            )}
        </div>
    );
}