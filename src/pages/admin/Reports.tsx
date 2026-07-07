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

            <div className="p-6">

                <h1 className="text-3xl font-bold mb-8">
                    Reports Dashboard
                </h1>



                {/* USERS */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4">
                        User Statistics
                    </h2>

                    <div className="grid grid-cols-4 gap-4">

                        <StatCard title="Total Users" value={totalUsers} />

                        <StatCard title="Students" value={students} />

                        <StatCard title="Supervisors" value={supervisors} />

                        <StatCard title="Admins" value={admins} />

                    </div>

                </div>




                {/* PROPOSALS */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Proposal Statistics
                    </h2>

                    <div className="grid grid-cols-4 gap-4">

                        <StatCard title="Total" value={totalProposals} />

                        <StatCard title="Draft" value={draft} />

                        <StatCard title="Submitted" value={submitted} />

                        <StatCard title="Under Review" value={underReview} />

                        <StatCard title="Revision Requested" value={revisions} />

                        <StatCard title="Resubmitted" value={resubmitted} />

                        <StatCard title="Approved" value={approved} />

                        <StatCard title="Rejected" value={rejected} />

                    </div>

                </div>




                {/* DEPARTMENTS */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Departments
                    </h2>

                    {Object.entries(departments).map(([dept, count]) => (

                        <div
                            key={dept}
                            className="flex justify-between border-b py-2"
                        >

                            <span>{dept}</span>

                            <span>{count}</span>

                        </div>

                    ))}

                </div>




                {/* SUPERVISOR WORKLOAD */}

                <div className="bg-white rounded-lg shadow border p-6 mb-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Supervisor Workload
                    </h2>

                    {workload.map(supervisor => (

                        <div
                            key={supervisor.name}
                            className="flex justify-between border-b py-2"
                        >

                            <span>{supervisor.name}</span>

                            <span>
                                {supervisor.count} proposal(s)
                            </span>

                        </div>

                    ))}

                </div>




                {/* VERSIONS */}

                <div className="bg-white rounded-lg shadow border p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Proposal Versions
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        <StatCard
                            title="Highest Version"
                            value={highestVersion}
                        />

                        <StatCard
                            title="Average Version"
                            value={averageVersion}
                        />

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );

}



function StatCard({
    title,
    value
}: {
    title: string;
    value: string | number;
}) {

    return (

        <div className="border rounded-lg p-4 bg-gray-50">

            <p className="text-gray-500 text-sm">
                {title}
            </p>

            <p className="text-3xl font-bold mt-2">
                {value}
            </p>

        </div>

    );

}