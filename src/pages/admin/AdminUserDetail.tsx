import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";


interface ProposalUser {
    [key: string]: UserProfile;
}

export default function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [relatedUsers, setRelatedUsers] = useState<ProposalUser>({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editPrefix, setEditPrefix] = useState("");
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editRole, setEditRole] = useState<"student" | "supervisor" | "admin">("student");
    const [editDepartment, setEditDepartment] = useState("");
    const [editAdmissionNumber, setEditAdmissionNumber] = useState("");
    const [editStaffNumber, setEditStaffNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadUser = async () => {
            const userSnap = await getDoc(doc(db, "users", id));
            if (!userSnap.exists()) { setLoading(false); return; }

            const userData = { id: userSnap.id, ...(userSnap.data() as Omit<UserProfile, "id">) };
            setUser(userData);

            const field = userData.role === "supervisor" ? "supervisorId" : "studentId";
            const proposalQuery = query(collection(db, "proposals"), where(field, "==", id));

            const unsubscribe = onSnapshot(proposalQuery, async (snapshot) => {
                const proposalData: Proposal[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Proposal, "id">)
                }));
                setProposals(proposalData);

                const usersMap: ProposalUser = {};
                for (const proposal of proposalData) {
                    const relatedId = userData.role === "supervisor" ? proposal.studentId : proposal.supervisorId;
                    if (relatedId && !usersMap[relatedId]) {
                        const relatedSnap = await getDoc(doc(db, "users", relatedId));
                        if (relatedSnap.exists()) {
                            usersMap[relatedId] = { id: relatedSnap.id, ...(relatedSnap.data() as Omit<UserProfile, "id">) };
                        }
                    }
                }
                setRelatedUsers(usersMap);
                setLoading(false);
            });

            return unsubscribe;
        };

        loadUser();
    }, [id]);

    useEffect(() => {
        if (user) {
            setEditPrefix(user.prefix || "");
            setEditFirstName(user.firstName || "");
            setEditLastName(user.lastName || "");
            setEditRole(user.role || "student");
            setEditDepartment(user.department || "");
            setEditAdmissionNumber(user.admissionNumber || "");
            setEditStaffNumber(user.staffNumber || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!id || !user) return;
        setSaving(true);
        try {
            const userRef = doc(db, "users", id);
            const updatedData: Partial<UserProfile> = {
                firstName: editFirstName,
                lastName: editLastName,
                role: editRole,
                department: editDepartment,
            };
            if (editRole === "student") {
                updatedData.admissionNumber = editAdmissionNumber;
                updatedData.staffNumber = "";
                updatedData.prefix = "";
            } else if (editRole === "supervisor") {
                updatedData.staffNumber = editStaffNumber;
                updatedData.admissionNumber = "";
                updatedData.prefix = editPrefix;
            } else {
                updatedData.admissionNumber = "";
                updatedData.staffNumber = "";
                updatedData.prefix = "";
            }

            await updateDoc(userRef, updatedData);
            setUser({ ...user, ...updatedData } as UserProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving user details:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !user) return;
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`
        );
        if (!confirmDelete) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, "users", id));
            navigate("/admin/users");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user account. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const roleColors: Record<string, string> = {
        student: "bg-amber-50 text-amber-700 border-amber-100",
        supervisor: "bg-amber-50 text-amber-700 border-amber-100",
        admin: "bg-amber-50 text-amber-700 border-amber-100",
    };

    const inputClass = "w-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300";

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading user details...</div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">User not found.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Back link */}
                <button
                    onClick={() => navigate("/admin/users")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Users
                </button>

                {/* User header */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-850 tracking-tight">
                                    {user.prefix ? `${user.prefix} ` : ""}{user.firstName} {user.lastName}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        {deleting ? "Deleting…" : "Delete Account"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                    >
                                        {saving ? "Saving…" : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            if (user) {
                                                setEditPrefix(user.prefix || "");
                                                setEditFirstName(user.firstName || "");
                                                setEditLastName(user.lastName || "");
                                                setEditRole(user.role || "student");
                                                setEditDepartment(user.department || "");
                                                setEditAdmissionNumber(user.admissionNumber || "");
                                                setEditStaffNumber(user.staffNumber || "");
                                            }
                                        }}
                                        disabled={saving}
                                        className="text-slate-400 hover:text-slate-600 font-bold text-xs px-4 py-2.5"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Info / Edit Form */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                        {isEditing ? "Edit Personal Information" : "Personal Information"}
                    </h2>

                    {!isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                            {[
                                { label: "Email Address", value: user.email },
                                { label: "Role", value: (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleColors[user.role] ?? "bg-slate-50 text-slate-500 border-slate-100"}`}>
                                        {user.role}
                                    </span>
                                )},
                                user.role === "supervisor" ? { label: "Title / Prefix", value: user.prefix || "—" } : null,
                                { label: "Department", value: user.department || "Not set" },
                                user.role === "student"
                                    ? { label: "Admission Number", value: user.admissionNumber || "Not set" }
                                    : user.role === "supervisor"
                                    ? { label: "Staff Number", value: user.staffNumber || "Not set" }
                                    : null,
                                { label: "Account Created", value: user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString() : "Unknown" },
                            ].filter(Boolean).map((field: any) => (
                                <div key={field.label} className="space-y-1">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</span>
                                    <div className="text-slate-700 font-semibold">{field.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {editRole === "supervisor" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title / Prefix</label>
                                    <select
                                        className={`${inputClass} bg-white cursor-pointer`}
                                        value={editPrefix}
                                        onChange={(e) => setEditPrefix(e.target.value)}
                                    >
                                        <option value="">— Select prefix —</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Prof.">Prof.</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Eng.">Eng.</option>
                                        <option value="Rev.">Rev.</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (Read-only)</label>
                                <input
                                    type="text"
                                    disabled
                                    className={`${inputClass} bg-slate-50/60 cursor-not-allowed opacity-70`}
                                    value={user.email}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                                    <select
                                        className={`${inputClass} bg-white cursor-pointer`}
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value as "student" | "supervisor" | "admin")}
                                    >
                                        <option value="student">Student</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={editDepartment}
                                        onChange={(e) => setEditDepartment(e.target.value)}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>

                            {editRole === "student" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Admission Number</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={editAdmissionNumber}
                                        onChange={(e) => setEditAdmissionNumber(e.target.value)}
                                        placeholder="e.g. S13/12345/18"
                                    />
                                </div>
                            )}

                            {editRole === "supervisor" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Staff Number</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={editStaffNumber}
                                        onChange={(e) => setEditStaffNumber(e.target.value)}
                                        placeholder="e.g. EMP4567"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Proposal Activity */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Proposal Activity</h2>

                    {proposals.length === 0 ? (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm">
                            <p className="text-slate-400 font-semibold text-sm">No proposals found for this user.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {proposals.map((proposal) => {
                                const otherUserId = user.role === "supervisor" ? proposal.studentId : proposal.supervisorId;
                                const otherUser = otherUserId ? relatedUsers[otherUserId] : null;

                                return (
                                    <div key={proposal.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-slate-800 text-sm leading-snug">{proposal.title}</h3>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <StatusBadge status={proposal.status} />
                                                    <span className="text-xs text-slate-400 font-medium">v{proposal.version}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-slate-50 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                                    {user.role === "supervisor" ? "Student" : "Supervisor"}
                                                </span>
                                                <span className="text-slate-700 font-semibold">
                                                    {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : user.role === "student" ? "Not assigned" : "Unknown"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Created</span>
                                                <span className="text-slate-500 font-medium">
                                                    {proposal.createdAt?.toDate ? proposal.createdAt.toDate().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Unknown"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Updated</span>
                                                <span className="text-slate-500 font-medium">
                                                    {proposal.updatedAt?.toDate ? proposal.updatedAt.toDate().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Unknown"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}