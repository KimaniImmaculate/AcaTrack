import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";


export default function AdminDashboard() {

    const navigate = useNavigate();

    const [users, setUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);


    // FETCH USERS
    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {
                setUsers(
                    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                );
            }
        );

        return () => unsubscribe();

    }, []);


    // FETCH PROPOSALS
    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "proposals"),
            (snapshot) => {
                setProposals(
                    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                );
            }
        );

        return () => unsubscribe();

    }, []);


    const students    = users.filter(u => u.role === "student");
    const supervisors = users.filter(u => u.role === "supervisor");


    return (

        <DashboardLayout>


            <div className="mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600">
                    Manage users, proposals and academic workflows.
                </p>
            </div>



            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-8">

                <div className="border rounded-lg p-5 bg-white">
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <p className="text-gray-500 text-sm">Students</p>
                    <p className="text-3xl font-bold">{students.length}</p>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <p className="text-gray-500 text-sm">Supervisors</p>
                    <p className="text-3xl font-bold">{supervisors.length}</p>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <p className="text-gray-500 text-sm">Proposals</p>
                    <p className="text-3xl font-bold">{proposals.length}</p>
                </div>

            </div>



            {/* QUICK ACTIONS */}
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

            <div className="grid grid-cols-2 gap-5">

                <div className="border rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-lg">User Management</h3>
                    <p className="text-gray-600 text-sm mt-2">
                        View and manage students, supervisors and administrators.
                    </p>
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Manage Users
                    </button>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-lg">Proposal Management</h3>
                    <p className="text-gray-600 text-sm mt-2">
                        Review all research proposals submitted in the system.
                    </p>
                    <button
                        onClick={() => navigate("/admin/proposals")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        View Proposals
                    </button>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-lg">Supervisor Assignment</h3>
                    <p className="text-gray-600 text-sm mt-2">
                        Assign students to available supervisors.
                    </p>
                    <button
                        onClick={() => navigate("/admin/assignments")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Assign Supervisors
                    </button>
                </div>

                <div className="border rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-lg">Reports</h3>
                    <p className="text-gray-600 text-sm mt-2">
                        View academic progress and system reports.
                    </p>
                    <button
                        onClick={() => navigate("/admin/reports")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        View Reports
                    </button>
                </div>

            </div>


        </DashboardLayout>

    );

}