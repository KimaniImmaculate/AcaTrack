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
    const [problemStatement, setProblemStatement] = useState("");
    const [objectives, setObjectives] = useState("");
    const [methodology, setMethodology] = useState("");
    const [expectedOutcome, setExpectedOutcome] = useState("");
    const [department, setDepartment] = useState("");
    const [supervisorId, setSupervisorId] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setLoading(true);

        try {
            await addDoc(collection(db, "proposals"), {
                title,
                abstract,
                problemStatement,
                objectives,
                methodology,
                expectedOutcome,
                department,

                studentId: user.uid,
                supervisorId: supervisorId || null,

                documentURL: "",

                version: 1,
                status: "draft",

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            navigate("/student/proposals");
        } catch (error) {
            console.error("Error creating proposal:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">

            <h1 className="text-2xl font-bold mb-6">
                New Research Proposal
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                <div>
                    <label className="block mb-1 font-medium">
                        Proposal Title
                    </label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Abstract
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border rounded p-2"
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Problem Statement
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border rounded p-2"
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Objectives
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border rounded p-2"
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Methodology
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border rounded p-2"
                        value={methodology}
                        onChange={(e) => setMethodology(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Expected Outcome
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border rounded p-2"
                        value={expectedOutcome}
                        onChange={(e) => setExpectedOutcome(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Department
                    </label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Supervisor (Optional)
                    </label>

                    <select
                        className="w-full border rounded p-2"
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                    >
                        <option value="">
                            Not sure - Help me assign
                        </option>

                        {supervisors.map((s) => (
                            <option
                                key={s.id}
                                value={s.id}
                            >
                                {s.firstName} {s.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:bg-gray-400"
                >
                    {loading ? "Saving..." : "Create Proposal"}
                </button>

            </form>

        </div>
    );
}