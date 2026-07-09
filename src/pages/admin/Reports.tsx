import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);

    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubProposals = onSnapshot(collection(db, "proposals"), (snapshot) => {
            setProposals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => { unsubUsers(); unsubProposals(); };
    }, []);

    // User statistics
    const totalUsers    = users.length;
    const students      = users.filter(u => u.role === "student").length;
    const supervisors   = users.filter(u => u.role === "supervisor").length;
    const admins        = users.filter(u => u.role === "admin").length;

    // Proposal statistics
    const totalProposals    = proposals.length;
    const draft             = proposals.filter(p => p.status === "draft").length;
    const submitted         = proposals.filter(p => p.status === "submitted").length;
    const underReview       = proposals.filter(p => p.status === "under_review").length;
    const revisions         = proposals.filter(p => p.status === "revision_requested").length;
    const resubmitted       = proposals.filter(p => p.status === "resubmitted").length;
    const approved          = proposals.filter(p => p.status === "approved").length;
    const rejected          = proposals.filter(p => p.status === "rejected").length;

    // Department stats
    const departments: Record<string, number> = {};
    users.forEach(user => {
        if (!user.department) return;
        departments[user.department] = (departments[user.department] || 0) + 1;
    });

    // Supervisor workload
    const workload = users
        .filter(u => u.role === "supervisor")
        .map(supervisor => ({
            name: `${supervisor.prefix ? `${supervisor.prefix} ` : ""}${supervisor.firstName} ${supervisor.lastName}`,
            count: proposals.filter(p => p.supervisorId === supervisor.id).length
        }));

    // Version stats
    const highestVersion = proposals.length
        ? Math.max(...proposals.map(p => p.version ?? 1))
        : 0;
    const averageVersion = proposals.length
        ? (proposals.reduce((sum, p) => sum + (p.version ?? 1), 0) / proposals.length).toFixed(1)
        : "0";

    // Export helpers
    const downloadCSV = (filename: string, content: string) => {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportUsersCSV = () => {
        const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Department", "Admission Number", "Staff Number"];
        const rows = users.map(u => [u.id || "", u.firstName || "", u.lastName || "", u.email || "", u.role || "", u.department || "", u.admissionNumber || "", u.staffNumber || ""]);
        const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
        downloadCSV("acatrack_users_report.csv", csvContent);
    };

    const exportProposalsCSV = () => {
        const headers = ["ID", "Title", "Student ID", "Supervisor ID", "Status", "Version", "Department"];
        const rows = proposals.map(p => [p.id || "", p.title || "", p.studentId || "", p.supervisorId || "", p.status || "", p.version || 1, p.department || ""]);
        const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
        downloadCSV("acatrack_proposals_report.csv", csvContent);
    };

    const exportWorkloadCSV = () => {
        const headers = ["Supervisor Name", "Assigned Proposals Count"];
        const rows = workload.map(w => [w.name || "", w.count || 0]);
        const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
        downloadCSV("acatrack_supervisor_workload_report.csv", csvContent);
    };

    const handlePrintPDF = () => window.print();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-slate-400 font-semibold">Loading reports...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    aside, header, .no-print { display: none !important; }
                    main, .print-area { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    body { background: white !important; color: black !important; }
                }
            `}} />

            <div className="space-y-8 print-area">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap no-print">
                    <div>
                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Reports & Analytics</h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            System-wide metrics, distribution analysis, and workload tracking.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={exportUsersCSV}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Users CSV
                        </button>
                        <button
                            onClick={exportProposalsCSV}
                            className="bg-amber-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Proposals CSV
                        </button>
                        <button
                            onClick={exportWorkloadCSV}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Workload CSV
                        </button>
                        <button
                            onClick={handlePrintPDF}
                            className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print PDF
                        </button>
                    </div>
                </div>

                {/* Print-only title */}
                <div className="hidden print:block mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold">AcaTrack Academic Report</h1>
                    <p className="text-sm text-gray-600 mt-1">Generated on: {new Date().toLocaleString()}</p>
                </div>

                {/* User Statistics */}
                <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-4">
                        User Statistics
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Total Users", value: totalUsers, color: "from-amber-500 to-blue-600" },
                            { label: "Students", value: students, color: "from-purple-500 to-violet-600" },
                            { label: "Supervisors", value: supervisors, color: "from-amber-500 to-orange-500" },
                            { label: "Admins", value: admins, color: "from-slate-500 to-slate-600" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 text-center space-y-1">
                                <div className={`text-3xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Proposal Statistics */}
                <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-4">
                        Proposal Statistics
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Total", value: totalProposals, color: "text-amber-600" },
                            { label: "Draft", value: draft, color: "text-slate-500" },
                            { label: "Submitted", value: submitted, color: "text-amber-600" },
                            { label: "Under Review", value: underReview, color: "text-yellow-600" },
                            { label: "Revisions", value: revisions, color: "text-amber-600" },
                            { label: "Resubmitted", value: resubmitted, color: "text-amber-600" },
                            { label: "Approved", value: approved, color: "text-emerald-600" },
                            { label: "Rejected", value: rejected, color: "text-red-500" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 text-center space-y-1">
                                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Department & Supervisor Workload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Distribution */}
                    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-4 flex items-center justify-between">
                            <span>Department Distribution</span>
                            <span className="text-slate-350 font-medium normal-case tracking-normal text-[10px]">count of users</span>
                        </h2>
                        {Object.keys(departments).length === 0 ? (
                            <p className="text-slate-400 text-sm font-semibold text-center py-6">No department data available.</p>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(departments).map(([dept, count]) => {
                                    const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                                    return (
                                        <div key={dept} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                                <span>{dept}</span>
                                                <span className="text-slate-400">{count} ({percentage.toFixed(0)}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-blue-600 h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Supervisor Workload */}
                    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-4 flex items-center justify-between">
                            <span>Supervisor Workload</span>
                            <span className="text-slate-350 font-medium normal-case tracking-normal text-[10px]">assigned proposals</span>
                        </h2>
                        {workload.length === 0 ? (
                            <p className="text-slate-400 text-sm font-semibold text-center py-6">No supervisors registered.</p>
                        ) : (
                            <div className="space-y-4">
                                {workload.map(supervisor => {
                                    const cap = 5;
                                    const percentage = Math.min((supervisor.count / cap) * 100, 100);
                                    const barColor = supervisor.count >= cap
                                        ? "from-red-500 to-rose-600"
                                        : supervisor.count >= 3
                                        ? "from-amber-500 to-orange-500"
                                        : "from-emerald-500 to-green-600";
                                    return (
                                        <div key={supervisor.name} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                                                <span>{supervisor.name}</span>
                                                <span className="text-slate-400">{supervisor.count} / {cap} proposals</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-700`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                {/* Version Stats */}
                <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-4">
                        Proposal Revision Metrics
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-5 text-center space-y-1">
                            <div className="text-4xl font-black text-slate-700">{highestVersion}</div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highest Version</p>
                        </div>
                        <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-5 text-center space-y-1">
                            <div className="text-4xl font-black text-slate-700">{averageVersion}</div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Version</p>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}