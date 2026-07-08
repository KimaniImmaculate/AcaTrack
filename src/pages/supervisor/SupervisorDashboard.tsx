import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

export default function SupervisorDashboard() {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {

        if (!user) return;

        const q = query(
            collection(db, "proposals"),
            where("supervisorId", "==", user.uid)
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
        total:           proposals.length,
        submitted:       proposals.filter(p => p.status === "submitted" || p.status === "resubmitted").length,
        underReview:     proposals.filter(p => p.status === "under_review").length,
        approved:        proposals.filter(p => p.status === "approved").length,
        rejected:        proposals.filter(p => p.status === "rejected").length,
    };

    return (
        <DashboardLayout>

            <h1 className="text-3xl font-bold text-blue-600">
                Supervisor Dashboard
            </h1>

            <div className="grid grid-cols-5 gap-4 mt-6">
                <StatCard title="Total"        value={stats.total} />
                <StatCard title="Submitted"    value={stats.submitted} />
                <StatCard title="Under Review" value={stats.underReview} />
                <StatCard title="Approved"     value={stats.approved} />
                <StatCard title="Rejected"     value={stats.rejected} />
            </div>

            <div className="mt-8">
                <button
                    onClick={() => navigate("/supervisor/assigned")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    View Assigned Proposals
                </button>
            </div>

        </DashboardLayout>
    );
}