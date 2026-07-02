import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function ProposalDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    /**
     * FETCH PROPOSAL
     */
    useEffect(() => {
        const load = async () => {
            if (!id || !user) return;

            const snap = await getDoc(doc(db, "proposals", id));

            if (!snap.exists()) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            const data = snap.data();

            // 🔒 ownership check (IMPORTANT)
            if (data.studentId !== user.uid) {
                navigate("/student/proposals");
                return;
            }

            setTitle(data.title);
            setAbstract(data.abstract);
            setStatus(data.status);

            setLoading(false);
        };

        load();
    }, [id, user]);

    const isDraft = status === "draft";

    /**
     * SAVE DRAFT
     */
    const handleSave = async () => {
        if (!id) return;

        await updateDoc(doc(db, "proposals", id), {
            title,
            abstract,
            updatedAt: serverTimestamp(),
        });

        alert("Draft saved");
    };

    /**
     * SUBMIT PROPOSAL
     */
    const handleSubmit = async () => {
        if (!id) return;

        await updateDoc(doc(db, "proposals", id), {
            title,
            abstract,
            status: "submitted",
            updatedAt: serverTimestamp(),
        });

        navigate("/student/proposals");
    };

    /**
     * LOADING STATE
     */
    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    /**
     * NOT FOUND STATE
     */
    if (notFound) {
        return <div className="p-6">Proposal not found</div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">
                    Proposal Detail
                </h1>

                <button
                    onClick={() => navigate("/student/proposals")}
                    className="border px-4 py-2 rounded"
                >
                    Back to Proposals
                </button>
            </div>

            {/* STATUS */}
            <p className="mb-3 text-sm text-gray-600">
                Status: {status}
            </p>

            {/* FORM */}
            <input
                className="border p-2 w-full mb-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isDraft}
            />

            <textarea
                className="border p-2 w-full mb-3"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                disabled={!isDraft}
            />

            {/* ACTIONS */}
            {isDraft && (
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="border px-4 py-2"
                    >
                        Save Draft
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2"
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}