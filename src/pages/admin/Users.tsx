import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import { usePagination } from "../../hooks/usePagination";

function PaginationBar({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goTo,
    goNext,
    goPrev,
    hasPrev,
    hasNext,
}: ReturnType<typeof usePagination>) {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(p =>
        p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
    );
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-600">{((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold text-slate-600">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <button onClick={goPrev} disabled={!hasPrev}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {visiblePages.map((p, idx) => {
                    const prev = visiblePages[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                        <span key={p} className="flex items-center gap-1">
                            {showEllipsis && <span className="text-slate-300 text-xs px-1">…</span>}
                            <button onClick={() => goTo(p)}
                                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${p === currentPage ? "bg-amber-500 border-amber-600 text-white shadow-sm" : "border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"}`}>
                                {p}
                            </button>
                        </span>
                    );
                })}
                <button onClick={goNext} disabled={!hasNext}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const data: UserProfile[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<UserProfile, "id">),
            }));
            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const roleOptions = [
        { key: "all", label: "All" },
        { key: "student", label: "Students" },
        { key: "supervisor", label: "Supervisors" },
        { key: "admin", label: "Admins" },
    ];

    const filtered = users
        .filter(u => roleFilter === "all" || u.role === roleFilter)
        .filter(u => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                u.firstName?.toLowerCase().includes(q) ||
                u.lastName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.department?.toLowerCase().includes(q)
            );
        });

    const pagination = usePagination(filtered, 15);

    const roleColors: Record<string, string> = {
        student: "bg-amber-50 text-amber-700 border-amber-100",
        supervisor: "bg-yellow-50 text-yellow-700 border-yellow-100",
        admin: "bg-slate-100 text-slate-700 border-slate-200",
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading users...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">User Management</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Manage all students, supervisors and administrators in the system.
                    </p>
                </div>

                {/* Summary pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {roleOptions.slice(1).map(r => {
                        const count = users.filter(u => u.role === r.key).length;
                        return (
                            <div key={r.key} className="bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs shadow-sm flex items-center gap-2">
                                <span className="font-bold text-slate-700">{count}</span>
                                <span className="text-slate-400 font-medium">{r.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Search & Filters */}
                <div className="space-y-3">
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email or department..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {roleOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => { setRoleFilter(opt.key); pagination.goTo(1); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                    roleFilter === opt.key
                                        ? "bg-amber-500 text-white border-amber-600"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        <span className="ml-auto text-xs font-semibold text-slate-400">
                            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission / Staff No.</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold text-sm">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    pagination.paginated.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <span className="font-semibold text-slate-800">
                                                        {user.prefix ? `${user.prefix} ` : ""}{user.firstName} {user.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleColors[user.role] ?? "bg-slate-50 text-slate-500 border-slate-100"}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{user.department || "—"}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {user.role === "student"
                                                    ? user.admissionNumber || "—"
                                                    : user.staffNumber || "—"
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <PaginationBar {...pagination} />
                </div>
            </div>
        </DashboardLayout>
    );
}