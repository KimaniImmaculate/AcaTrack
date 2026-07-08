import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot
} from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";

export default function Reports() {

    const [loading, setLoading] = useState(true);

    const [users, setUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);

    useEffect(() => {

        const unsubUsers = onSnapshot(
            collection(db, "users"),
            (snapshot) => {

                setUsers(
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );

            }
        );

        const unsubProposals = onSnapshot(
            collection(db, "proposals"),
            (snapshot) => {

                setProposals(
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );

                setLoading(false);

            }
        );

        return () => {
            unsubUsers();
            unsubProposals();
        };

    }, []);



    //-------------------------
    // USER STATISTICS
    //-------------------------

    const totalUsers = users.length;

    const students =
        users.filter(u => u.role === "student").length;

    const supervisors =
        users.filter(u => u.role === "supervisor").length;

    const admins =
        users.filter(u => u.role === "admin").length;



    //-------------------------
    // PROPOSAL STATISTICS
    //-------------------------

    const totalProposals = proposals.length;

    const draft =
        proposals.filter(p => p.status === "draft").length;

    const submitted =
        proposals.filter(p => p.status === "submitted").length;

    const underReview =
        proposals.filter(p => p.status === "under_review").length;

    const revisions =
        proposals.filter(
            p => p.status === "revision_requested"
        ).length;

    const resubmitted =
        proposals.filter(
            p => p.status === "resubmitted"
        ).length;

    const approved =
        proposals.filter(
            p => p.status === "approved"
        ).length;

    const rejected =
        proposals.filter(
            p => p.status === "rejected"
        ).length;



    //-------------------------
    // DEPARTMENT STATS
    //-------------------------

    const departments: Record<string, number> = {};

    users.forEach(user => {

        if (!user.department) return;

        departments[user.department] =
            (departments[user.department] || 0) + 1;

    });



    //-------------------------
    // SUPERVISOR WORKLOAD
    //-------------------------

    const workload = supervisors === 0
        ? []
        : users
            .filter(u => u.role === "supervisor")
            .map(supervisor => {

                const assigned =
                    proposals.filter(
                        proposal =>
                            proposal.supervisorId === supervisor.id
                    ).length;

                return {

                    name:
                        `${supervisor.firstName} ${supervisor.lastName}`,

                    count: assigned

                };

            });



    //-------------------------
    // VERSION STATS
    //-------------------------

    const highestVersion =
        proposals.length
            ? Math.max(
                ...proposals.map(
                    proposal => proposal.version ?? 1
                )
            )
            : 0;

    const averageVersion =
        proposals.length
            ? (
                proposals.reduce(
                    (sum, proposal) =>
                        sum + (proposal.version ?? 1),
                    0
                ) / proposals.length
            ).toFixed(1)
            : "0";


    // PDF Export
    const handlePrintPDF = () => {
        window.print();
    };

    // Generic CSV Download
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

    // Export Users to CSV
    const exportUsersCSV = () => {
        const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Department", "Admission Number", "Staff Number"];
        const rows = users.map(u => [
            u.id || "",
            u.firstName || "",
            u.lastName || "",
            u.email || "",
            u.role || "",
            u.department || "",
            u.admissionNumber || "",
            u.staffNumber || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        downloadCSV("acatrack_users_report.csv", csvContent);
    };

    // Export Proposals to CSV
    const exportProposalsCSV = () => {
        const headers = ["ID", "Title", "Student ID", "Supervisor ID", "Status", "Version", "Department"];
        const rows = proposals.map(p => [
            p.id || "",
            p.title || "",
            p.studentId || "",
            p.supervisorId || "",
            p.status || "",
            p.version || 1,
            p.department || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        downloadCSV("acatrack_proposals_report.csv", csvContent);
    };

    // Export Workload to CSV
    const exportWorkloadCSV = () => {
        const headers = ["Supervisor Name", "Assigned Proposals Count"];
        const rows = workload.map(w => [
            w.name || "",
            w.count || 0
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        downloadCSV("acatrack_supervisor_workload_report.csv", csvContent);
    };


    if (loading) {

        return (

            <DashboardLayout>

                <div className="p-6">
                    Loading reports...
                </div>

            </DashboardLayout>

        );

    }



    return (

        <DashboardLayout>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    aside, header, .no-print {
                        display: none !important;
                    }
                    main, .print-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .bg-gray-100 {
                        background-color: transparent !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .shadow, .border {
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                    }
                }
            `}} />

            <div className="p-6 print-area">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8 flex-wrap gap-4 no-print border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Reports Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Download summaries and monitor research metrics.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={exportUsersCSV}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                        >
                            Users CSV
                        </button>
                        <button
                            onClick={exportProposalsCSV}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                        >
                            Proposals CSV
                        </button>
                        <button
                            onClick={exportWorkloadCSV}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                        >
                            Workloads CSV
                        </button>
                        <button
                            onClick={handlePrintPDF}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                        >
                            PDF Summary
                        </button>
                    </div>
                </div>

                {/* Print Title (Only visible in Print Mode) */}
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">AcaTrack Academic Report</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Generated on: {new Date().toLocaleString()}
                    </p>
                </div>


                {/* USERS */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        User Statistics
                    </h2>

                    <div className="grid grid-cols-4 gap-4">

                        <StatCard title="Total Users" value={totalUsers} className="border-blue-200 bg-blue-50/40 text-blue-900" />

                        <StatCard title="Students" value={students} className="border-indigo-200 bg-indigo-50/40 text-indigo-900" />

                        <StatCard title="Supervisors" value={supervisors} className="border-cyan-200 bg-cyan-50/40 text-cyan-900" />

                        <StatCard title="Admins" value={admins} className="border-gray-200 bg-gray-50/40 text-gray-900" />

                    </div>

                </div>




                {/* PROPOSALS */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Proposal Statistics
                    </h2>

                    <div className="grid grid-cols-4 gap-4">

                        <StatCard title="Total" value={totalProposals} className="border-blue-200 bg-blue-50/40" />

                        <StatCard title="Draft" value={draft} className="border-gray-200 bg-gray-50/40" />

                        <StatCard title="Submitted" value={submitted} className="border-indigo-200 bg-indigo-50/40" />

                        <StatCard title="Under Review" value={underReview} className="border-cyan-200 bg-cyan-50/40" />

                        <StatCard title="Revision Requested" value={revisions} className="border-yellow-200 bg-yellow-50/40" />

                        <StatCard title="Resubmitted" value={resubmitted} className="border-purple-200 bg-purple-50/40" />

                        <StatCard title="Approved" value={approved} className="border-green-200 bg-green-50/40" />

                        <StatCard title="Rejected" value={rejected} className="border-red-200 bg-red-50/40" />

                    </div>

                </div>




                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* DEPARTMENTS */}

                    <div className="bg-white rounded-lg shadow border p-6">

                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex justify-between items-center">
                            <span>Departments Distribution</span>
                            <span className="text-xs text-gray-400 font-normal">Count of Users</span>
                        </h2>

                        <div className="space-y-4">
                            {Object.entries(departments).map(([dept, count]) => {
                                const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                                return (
                                    <div key={dept} className="space-y-1">
                                        <div className="flex justify-between text-sm font-medium text-gray-700">
                                            <span>{dept}</span>
                                            <span>{count} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>




                    {/* SUPERVISOR WORKLOAD */}

                    <div className="bg-white rounded-lg shadow border p-6">

                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex justify-between items-center">
                            <span>Supervisor Workload</span>
                            <span className="text-xs text-gray-400 font-normal">Assigned Proposals</span>
                        </h2>

                        <div className="space-y-4">
                            {workload.map(supervisor => {
                                const cap = 5;
                                const percentage = Math.min((supervisor.count / cap) * 100, 100);
                                const barColor = supervisor.count >= cap ? "bg-red-500" : supervisor.count >= 3 ? "bg-yellow-500" : "bg-green-500";
                                return (
                                    <div key={supervisor.name} className="space-y-1">
                                        <div className="flex justify-between text-sm font-medium text-gray-700">
                                            <span>{supervisor.name}</span>
                                            <span>{supervisor.count} / {cap} proposals</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                </div>




                {/* VERSIONS */}

                <div className="bg-white rounded-lg shadow border p-6">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Proposal Versions
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        <StatCard
                            title="Highest Version"
                            value={highestVersion}
                            className="border-gray-200 bg-gray-50/40"
                        />

                        <StatCard
                            title="Average Version"
                            value={averageVersion}
                            className="border-gray-200 bg-gray-50/40"
                        />

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );

}



function StatCard({
    title,
    value,
    className = "border-gray-200 bg-gray-50"
}: {
    title: string;
    value: string | number;
    className?: string;
}) {

    return (

        <div className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-sm ${className}`}>

            <p className="text-gray-500 text-sm">
                {title}
            </p>

            <p className="text-3xl font-bold mt-2">
                {value}
            </p>

        </div>

    );

}