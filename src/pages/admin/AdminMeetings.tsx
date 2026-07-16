import { useEffect, useState } from "react";
import { collection, onSnapshot, getDoc, doc } from "firebase/firestore";
import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

type FilterKey = "all" | "pending" | "approved_waiting_link" | "scheduled" | "completed" | "cancelled";

const STATUS_BADGE: Record<string, { label: string; color: string; dot: string }> = {
    pending:               { label: "Pending",       color: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
    approved_waiting_link: { label: "Awaiting Link", color: "bg-blue-100 text-blue-700",       dot: "bg-blue-400" },
    scheduled:             { label: "Upcoming",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
    completed:             { label: "Completed",     color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
    cancelled:             { label: "Cancelled",     color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    declined:              { label: "Declined",      color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    rescheduled:           { label: "Rescheduled",   color: "bg-purple-100 text-purple-700",   dot: "bg-purple-400" },
};

const FILTERS: { key: FilterKey; label: string; activeClass: string }[] = [
    { key: "all",                   label: "All",           activeClass: "bg-slate-800 text-white" },
    { key: "pending",               label: "Pending",       activeClass: "bg-amber-500 text-white" },
    { key: "approved_waiting_link", label: "Awaiting Link", activeClass: "bg-blue-500 text-white" },
    { key: "scheduled",             label: "Upcoming",      activeClass: "bg-emerald-600 text-white" },
    { key: "completed",             label: "Completed",     activeClass: "bg-slate-600 text-white" },
    { key: "cancelled",             label: "Cancelled",     activeClass: "bg-rose-600 text-white" },
];

export default function AdminMeetings() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [names, setNames] = useState<Record<string, string>>({});
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "meetingRequests"), snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeetings(data);
            loadNames(data);
        });
        return () => unsubscribe();
    }, []);

    async function loadNames(data: any[]) {
        for (const meeting of data) {
            for (const id of [meeting.studentId, meeting.supervisorId]) {
                if (!id || names[id]) continue;
                const userSnap = await getDoc(doc(db, "users", id));
                if (userSnap.exists()) {
                    const u = userSnap.data();
                    setNames(prev => ({ ...prev, [id]: `${u.firstName} ${u.lastName}` }));
                }
            }
        }
    }

    const byStatus = activeFilter === "all"
        ? meetings
        : activeFilter === "cancelled"
            ? meetings.filter(m => m.status === "cancelled" || m.status === "declined")
            : activeFilter === "scheduled"
                ? meetings.filter(m => m.status === "scheduled" || m.status === "rescheduled")
                : meetings.filter(m => m.status === activeFilter);

    const filtered = search.trim()
        ? byStatus.filter(m => {
            const q = search.toLowerCase();
            return (
                (names[m.studentId] || "").toLowerCase().includes(q) ||
                (names[m.supervisorId] || "").toLowerCase().includes(q) ||
                (m.title || "").toLowerCase().includes(q) ||
                (m.mode || "").toLowerCase().includes(q)
            );
          })
        : byStatus;

    // Summary counts
    const counts: Record<string, number> = {};
    for (const m of meetings) {
        let statusKey = m.status;
        if (statusKey === "declined") statusKey = "cancelled";
        if (statusKey === "rescheduled") statusKey = "scheduled";
        counts[statusKey] = (counts[statusKey] || 0) + 1;
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">All Meetings</h1>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                            Monitor all student-supervisor meetings across AcaTrack.
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm text-center">
                        <p className="text-2xl font-black text-slate-800">{meetings.length}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { key: "pending",               label: "Pending",       color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
                        { key: "approved_waiting_link", label: "Awaiting Link", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
                        { key: "scheduled",             label: "Upcoming",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                        { key: "completed",             label: "Completed",     color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
                        { key: "cancelled",             label: "Cancelled",     color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100" },
                    ].map(stat => (
                        <button
                            key={stat.key}
                            onClick={() => setActiveFilter(stat.key as FilterKey)}
                            className={`${stat.bg} border ${stat.border} rounded-2xl px-4 py-3 text-left transition-all hover:shadow-sm cursor-pointer ${activeFilter === stat.key ? "ring-2 ring-offset-1 ring-slate-300" : ""}`}
                        >
                            <p className={`text-2xl font-black ${stat.color}`}>{counts[stat.key] ?? 0}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</p>
                        </button>
                    ))}
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
                        placeholder="Search by student, supervisor, title or mode…"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeFilter === f.key ? f.activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            {f.label}
                            {f.key !== "all" && (
                                <span className="ml-2 opacity-70 text-xs">({counts[f.key] ?? 0})</span>
                            )}
                        </button>
                    ))}
                    <span className="ml-auto text-xs font-semibold text-slate-400">
                        {filtered.length} meeting{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisor</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold">
                                            No meetings found.
                                        </td>
                                    </tr>
                                )}
                                {filtered.map((meeting, i) => {
                                    const badge = STATUS_BADGE[meeting.status] ?? { label: meeting.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                                    return (
                                        <tr
                                            key={meeting.id}
                                            className={`border-t border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                                        >
                                            <td className="p-4 font-semibold text-slate-800">
                                                {names[meeting.studentId] || <span className="text-slate-300 text-xs">Loading…</span>}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {names[meeting.supervisorId] || <span className="text-slate-300 text-xs">Loading…</span>}
                                            </td>
                                            <td className="p-4 text-slate-700 max-w-[180px] truncate" title={meeting.title}>
                                                {meeting.title || "—"}
                                            </td>
                                            <td className="p-4 text-slate-500 whitespace-nowrap">
                                                {meeting.requestedDate || "—"}
                                                {meeting.requestedTime && <span className="ml-1 text-slate-400 text-xs">{meeting.requestedTime}</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize text-slate-600">{meeting.mode || "—"}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                                                    className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                                >
                                                    View →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}