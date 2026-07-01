import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

/**
 * NEW PROPOSAL PAGE
 * ------------------
 * Allows students to create and submit research proposals
 */
export default function NewProposal() {
    const { user } = useAuth();

    // form state
    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * SUBMIT PROPOSAL
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "proposals"), {
                title,
                abstract,
                status: "submitted", // initial status
                studentId: user?.uid,
                createdAt: new Date()
            });

            alert("Proposal submitted successfully!");

            // reset form
            setTitle("");
            setAbstract("");
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">
                Create New Proposal
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">

                {/* Title */}
                <input
                    className="border p-2 w-full"
                    placeholder="Research Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Abstract */}
                <textarea
                    className="border p-2 w-full"
                    placeholder="Abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                />

                {/* Submit button */}
                <button
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2"
                >
                    {loading ? "Submitting..." : "Submit Proposal"}
                </button>
            </form>
        </div>
    );
}