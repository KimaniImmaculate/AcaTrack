import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { Proposal } from "../../types/Proposal";

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "proposals"),
            where("studentId", "==", user.uid)
        );

        const unsub = onSnapshot(q, (snap) => {
            setProposals(
                snap.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Proposal, "id">),
                }))
            );
        });

        return () => unsub();
    }, [user]);

    const stats = {
        total: proposals.length,
        draft: proposals.filter(p => p.status === "draft").length,
        submitted: proposals.filter(p => p.status === "submitted").length,
        approved: proposals.filter(p => p.status === "approved").length,
        rejected: proposals.filter(p => p.status === "rejected").length,
    };

    return (
        <DashboardLayout>

            <h1 className="text-3xl font-bold text-blue-600">
                Student Dashboard
            </h1>

            <div className="grid grid-cols-5 gap-4 mt-6">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Draft" value={stats.draft} />
                <StatCard title="Submitted" value={stats.submitted} />
                <StatCard title="Approved" value={stats.approved} />
                <StatCard title="Rejected" value={stats.rejected} />
            </div>

            <div className="mt-8">
                <button
                    onClick={() => navigate("/student/new-proposal")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Start Proposal
                </button>
            </div>

        </DashboardLayout>
    );
}