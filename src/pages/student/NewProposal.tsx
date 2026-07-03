import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSupervisors } from "../../hooks/useSupervisors";

export default function NewProposal() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { supervisors } = useSupervisors();

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [supervisorId, setSupervisorId] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) return;

            await addDoc(collection(db, "proposals"), {
                title,
                abstract,
                status: "draft",
                studentId: user.uid,
                supervisorId: supervisorId || null,
                version: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            navigate("/student/proposals");

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">

            <h1 className="text-xl font-bold mb-4">
                New Proposal
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">

                <input
                    className="border p-2 w-full"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    className="border p-2 w-full"
                    placeholder="Abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                />

                {/* SUPERVISOR DROPDOWN */}
                <select
                    className="border p-2 w-full"
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                >
                    <option value="">
                        Select Supervisor (optional)
                    </option>

                    {supervisors.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                        </option>
                    ))}
                </select>

                <button
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 w-full"
                >
                    {loading ? "Saving..." : "Save Proposal"}
                </button>

            </form>

        </div>
    );
}