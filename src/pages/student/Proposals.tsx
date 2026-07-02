import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Proposal } from "../../types/Proposal";

export default function Proposals() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;

            const q = query(
                collection(db, "proposals"),
                where("studentId", "==", user.uid)
            );

            const snap = await getDocs(q);

            const data: Proposal[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Proposal, "id">),
            }));

            setProposals(data);
            setLoading(false);
        };

        fetch();
    }, [user]);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">My Proposals</h1>

            {proposals.map((p) => (
                <div
                    key={p.id}
                    onClick={() => navigate(`/student/proposals/${p.id}`)}
                    className="p-4 border rounded cursor-pointer hover:bg-gray-50"
                >
                    <h2 className="font-semibold">{p.title}</h2>
                    <p className="text-sm text-gray-600">
                        Status: {p.status}
                    </p>
                </div>
            ))}

        </div>
    );
}