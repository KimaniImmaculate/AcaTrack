import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";

interface DonutData {
    label: string;
    value: number;
    color: string;
}

function DonutChart({ data }: { data: DonutData[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedPercentage = 0;

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <svg className="w-10 h-10 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                <p className="text-xs font-semibold">No data available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f8fafc" strokeWidth="12" />
                    {data.map((item, index) => {
                        if (item.value === 0) return null;
                        const percentage = (item.value / total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = 100 - accumulatedPercentage;
                        accumulatedPercentage += percentage;

                        return (
                            <circle
                                key={index}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="12"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                pathLength="100"
                                className="transition-all duration-500 ease-in-out"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-6 shadow-sm border border-slate-50">
                    <span className="text-2xl font-black text-slate-800">{total}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 flex-1 w-full">
                {data.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 font-semibold">{item.label}</span>
                            </div>
                            <span className="text-slate-500 font-bold">{item.value} <span className="text-slate-350 font-medium text-[10px]">({percentage.toFixed(0)}%)</span></span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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

    // User counts
    const totalUsers = users.length;
    const students = users.filter(u => u.role === "student").length;
    const supervisors = users.filter(u => u.role === "supervisor").length;
    const admins = users.filter(u => u.role === "admin").length;

    // Proposal counts
    const totalProposals = proposals.length;
    const approved = proposals.filter(p => p.status === "approved").length;
    const underReview = proposals.filter(p => p.status === "under_review").length;
    const revisions = proposals.filter(p => p.status === "revision_requested").length;
    const submitted = proposals.filter(p => p.status === "submitted").length;
    const resubmitted = proposals.filter(p => p.status === "resubmitted").length;
    const draft = proposals.filter(p => p.status === "draft").length;
    const rejected = proposals.filter(p => p.status === "rejected").length;

    // Department counts
    const departments: Record<string, number> = {};
    users.forEach(user => {
        if (!user.department) return;
        departments[user.department] = (departments[user.department] || 0) + 1;
    });

    // Workload counts
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
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reports & Analytics</h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            Visual system metrics, workload distribution, and resource analytics.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={exportUsersCSV}
                            className="bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Users
                        </button>
                        <button
                            onClick={exportProposalsCSV}
                            className="bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Proposals
                        </button>
                        <button
                            onClick={exportWorkloadCSV}
                            className="bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Workload
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-amber-500/10 hover:shadow-lg"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Print-only title */}
                <div className="hidden print:block mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold">AcaTrack Academic Report</h1>
                    <p className="text-sm text-gray-600 mt-1">Generated on: {new Date().toLocaleString()}</p>
                </div>

                {/* Visual Distribution Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User distribution */}
                    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">
                                User Role Distribution
                            </h2>
                            <DonutChart data={[
                                { label: "Students", value: students, color: "#f59e0b" },
                                { label: "Supervisors", value: supervisors, color: "#3b82f6" },
                                { label: "Admins", value: admins, color: "#64748b" }
                            ]} />
                        </div>
                    </section>

                    {/* Proposal Status distribution */}
                    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">
                                Proposal Status Distribution
                            </h2>
                            <DonutChart data={[
                                { label: "Approved", value: approved, color: "#10b981" },
                                { label: "Under Review", value: underReview, color: "#3b82f6" },
                                { label: "Revision Requested", value: revisions, color: "#8b5cf6" },
                                { label: "Submitted", value: submitted, color: "#f59e0b" },
                                { label: "Draft", value: draft, color: "#94a3b8" },
                                { label: "Rejected", value: rejected, color: "#ef4444" }
                            ]} />
                        </div>
                    </section>
                </div>

                {/* Detailed Numbers Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{students}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Proposals</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{totalProposals}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highest Proposal Version</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">v{highestVersion}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Revision Count</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{averageVersion}</p>
                    </div>
                </div>

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
            </div>
        </DashboardLayout>
    );
}