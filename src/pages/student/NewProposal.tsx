import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function NewProposal() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            await addDoc(collection(db, "proposals"), {
                title,
                abstract,
                status: "draft",
                studentId: user.uid,
                version: 1,
                supervisorId: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            navigate("/student/proposals");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">New Proposal</h1>

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

                <button
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2"
                >
                    {loading ? "Saving..." : "Save Draft"}
                </button>

            </form>
        </div>
    );
}