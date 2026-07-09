import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import StatusBadge from "../../components/StatusBadge";
import { Proposal } from "../../types/Proposal";
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-600">{((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold text-slate-600">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={goPrev}
                    disabled={!hasPrev}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {visiblePages.map((p, idx) => {
                    const prev = visiblePages[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                        <span key={p} className="flex items-center gap-1">
                            {showEllipsis && <span className="text-slate-300 text-xs px-1">…</span>}
                            <button
                                onClick={() => goTo(p)}
                                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                    p === currentPage
                                        ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                                        : "border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
                                }`}
                            >
                                {p}
                            </button>
                        </span>
                    );
                })}
                <button
                    onClick={goNext}
                    disabled={!hasNext}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function AdminProposals() {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [users,     setUsers]     = useState<any[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [filter,    setFilter]    = useState("all");
    const [search,    setSearch]    = useState("");

    useEffect(() => {
        const q = query(collection(db, "proposals"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Proposal[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Proposal, "id">),
            }));
            setProposals(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const getUserName = (userId?: string | null) => {
        if (!userId) return "Not Assigned";
        const user = users.find((u) => u.id === userId);
        if (!user) return "User unavailable";
        return `${user.prefix ? `${user.prefix} ` : ""}${user.firstName} ${user.lastName}`;
    };

    const statusOptions = [
        { key: "all",                label: "All" },
        { key: "draft",              label: "Draft" },
        { key: "submitted",          label: "Submitted" },
        { key: "resubmitted",        label: "Resubmitted" },
        { key: "under_review",       label: "Under Review" },
        { key: "revision_requested", label: "Revision Req." },
        { key: "approved",           label: "Approved" },
        { key: "rejected",           label: "Rejected" },
    ];

    const filtered = proposals
        .filter(p => filter === "all" || p.status === filter)
        .filter(p =>
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.department?.toLowerCase().includes(search.toLowerCase())
        );

    const pagination = usePagination(filtered, 10);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading proposals...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-850 tracking-tight">All Proposals</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        View and monitor all research proposals across all students.
                    </p>
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
                            onChange={e => { setSearch(e.target.value); pagination.goTo(1); }}
                            placeholder="Search by title or department..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => { setFilter(opt.key); pagination.goTo(1); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                    filter === opt.key
                                        ? "bg-amber-500 text-white border-amber-600"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        <span className="ml-auto text-xs font-semibold text-slate-400">
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-semibold text-sm">No proposals found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pagination.paginated.map((proposal) => (
                            <div
                                key={proposal.id}
                                onClick={() => navigate(`/admin/proposals/${proposal.id}`)}
                                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-amber-600 transition-colors">
                                            {proposal.title}
                                        </h2>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                            {proposal.department || "No department"}
                                        </p>
                                    </div>
                                    <StatusBadge status={proposal.status} />
                                </div>

                                <div className="mt-4 border-t border-slate-50 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Student</span>
                                        <span className="text-slate-700 font-semibold">{getUserName(proposal.studentId)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Supervisor</span>
                                        <span className="text-slate-700 font-semibold">{getUserName(proposal.supervisorId)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Version</span>
                                        <span className="text-slate-700 font-semibold">v{proposal.version}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ID</span>
                                        <span className="text-slate-500 font-mono text-[10px]">{proposal.id.slice(0, 12)}…</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                            <PaginationBar {...pagination} />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}