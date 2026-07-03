import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";
import { statusMessages, statusColors } from "../../utils/statusIntelligence";

export default function Proposals() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * REAL-TIME FIRESTORE LISTENER
     */
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "proposals"),
            where("studentId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data: Proposal[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Proposal, "id">),
            }));

            setProposals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                My Proposals
            </h1>

            {proposals.length === 0 ? (
                <p className="text-gray-500">
                    No proposals yet. Create your first proposal.
                </p>
            ) : (
                <div className="space-y-3">

                    {proposals.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => navigate(`/student/proposals/${p.id}`)}
                            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
                        >
                            <h2 className="font-semibold">
                                {p.title}
                            </h2>

                            {/* STATUS INTELLIGENCE */}
                            <div className="mt-2">
                                <StatusBadge status={p.status} />

                                <div className={`mt-2 text-sm ${statusColors[p.status]}`}>
                                    {statusMessages[p.status]}
                                </div>
                            </div>

                            {/* ACTION REQUIRED BANNER */}
                            {p.status === "revision_requested" && (
                                <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded">
                                    Action required: update your proposal and resubmit.
                                </div>
                            )}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}