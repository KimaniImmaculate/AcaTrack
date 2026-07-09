import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { assignSupervisor } from "../../services/proposalWorkflow";
import { Proposal } from "../../types/Proposal";


interface StudentAssignment {
    id: string;
    title: string;
    studentId: string;
    supervisorId?: string | null;
    status:
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "resubmitted"
    | "approved"
    | "rejected";
}



export default function AssignSupervisor() {
    const { user, profile } = useAuth();
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [supervisors, setSupervisors] = useState<UserProfile[]>([]);
    const [proposals, setProposals] = useState<StudentAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const studentQuery = query(collection(db, "users"), where("role", "==", "student"));
        const unsubStudents = onSnapshot(studentQuery, (snapshot) => {
            const data: UserProfile[] = snapshot.docs.map((item) => {
                const user = item.data();
                return {
                    id: item.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    admissionNumber: user.admissionNumber,
                    staffNumber: user.staffNumber,
                    createdAt: user.createdAt
                } as UserProfile;
            });
            setStudents(data);
        });

        const supervisorQuery = query(collection(db, "users"), where("role", "==", "supervisor"));
        const unsubSupervisors = onSnapshot(supervisorQuery, (snapshot) => {
            const data: UserProfile[] = snapshot.docs.map((item) => {
                const user = item.data();
                return {
                    id: item.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    admissionNumber: user.admissionNumber,
                    staffNumber: user.staffNumber,
                    createdAt: user.createdAt
                } as UserProfile;
            });
            setSupervisors(data);
        });

        const unsubProposals = onSnapshot(collection(db, "proposals"), (snapshot) => {
            const data: StudentAssignment[] = snapshot.docs.map((item) => {
                const proposal = item.data();
                return {
                    id: item.id,
                    title: proposal.title,
                    studentId: proposal.studentId,
                    supervisorId: proposal.supervisorId ?? null,
                    status: proposal.status ?? "draft",
                };
            });
            setProposals(data);
            setLoading(false);
        });

        return () => {
            unsubStudents();
            unsubSupervisors();
            unsubProposals();
        };
    }, []);

    const changeSupervisor = async (proposalId: string, supervisorId: string) => {
        if (!user) return;
        const prop = proposals.find((p) => p.id === proposalId);
        if (!prop) return;

        const supervisor = supervisors.find((s) => s.id === supervisorId);
        const supervisorName = supervisor ? `${supervisor.prefix ? `${supervisor.prefix} ` : ""}${supervisor.firstName} ${supervisor.lastName}` : null;
        const targetSupervisorId = supervisorId === "" ? null : supervisorId;

        const actor = {
            uid: user.uid,
            name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Admin",
            role: "admin" as const
        };

        const mockProposal = { id: prop.id, studentId: prop.studentId } as Proposal;
        await assignSupervisor(mockProposal, targetSupervisorId, supervisorName, actor);
    };

    const filtered = proposals.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        const student = students.find(s => s.id === p.studentId);
        return (
            p.title.toLowerCase().includes(q) ||
            student?.firstName?.toLowerCase().includes(q) ||
            student?.lastName?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading assignments...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">Supervisor Assignment</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Assign supervisors to student proposals. Changes take effect immediately.
                    </p>
                </div>

                {/* Summary stats */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs shadow-sm flex items-center gap-2">
                        <span className="font-black text-slate-800 text-base">{proposals.filter(p => !p.supervisorId).length}</span>
                        <span className="text-slate-400 font-medium">unassigned proposals</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs shadow-sm flex items-center gap-2">
                        <span className="font-black text-slate-800 text-base">{supervisors.length}</span>
                        <span className="text-slate-400 font-medium">available supervisors</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by proposal title or student name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>

                {/* Proposals List */}
                {filtered.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <p className="text-slate-400 font-semibold text-sm">No proposals found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((proposal) => {
                            const student = students.find(s => s.id === proposal.studentId);
                            const currentSupervisor = supervisors.find(s => s.id === proposal.supervisorId);
                            const isUnassigned = !proposal.supervisorId;

                            return (
                                <div
                                    key={proposal.id}
                                    className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${isUnassigned ? "border-amber-200/80" : "border-slate-200/80"}`}
                                >
                                    {/* Unassigned badge */}
                                    {isUnassigned && (
                                        <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            No supervisor assigned
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="font-bold text-slate-800 text-sm leading-snug">{proposal.title}</h2>
                                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                                <StatusBadge status={proposal.status} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-slate-100 pt-4">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Student</span>
                                            <span className="text-slate-700 font-semibold">
                                                {student ? `${student.firstName} ${student.lastName}` : "Unknown"}
                                            </span>
                                            {student?.department && (
                                                <p className="text-slate-400 font-medium mt-0.5">{student.department}</p>
                                            )}
                                        </div>

                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Supervisor</span>
                                            <span className={`font-semibold ${currentSupervisor ? "text-slate-700" : "text-slate-400 italic"}`}>
                                                {currentSupervisor
                                                    ? `${currentSupervisor.prefix ? `${currentSupervisor.prefix} ` : ""}${currentSupervisor.firstName} ${currentSupervisor.lastName}`
                                                    : "Not Assigned"}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Assign Supervisor
                                            </label>
                                            <select
                                                className="w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition-all bg-white cursor-pointer"
                                                value={proposal.supervisorId ?? ""}
                                                onChange={(e) => changeSupervisor(proposal.id, e.target.value)}
                                            >
                                                <option value="">No Supervisor / Remove</option>
                                                {supervisors.map((supervisor) => (
                                                    <option key={supervisor.id} value={supervisor.id}>
                                                        {supervisor.prefix ? `${supervisor.prefix} ` : ""}{supervisor.firstName} {supervisor.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}