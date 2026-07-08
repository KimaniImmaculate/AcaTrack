import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSupervisors } from "../../hooks/useSupervisors";
import { uploadProposalDocument } from "../../services/storageService";

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

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!user) return;


        setLoading(true);


        try {

            let docUrl = "";
            if (file) {
                docUrl = await uploadProposalDocument(user.uid, file);
            }

            await addDoc(
                collection(db, "proposals"),
                {

                    title,
                    abstract,
                    problemStatement,
                    objectives,
                    methodology,
                    expectedOutcome,
                    department,

                    studentId: user.uid,

                    supervisorId:
                        supervisorId || null,


                    documentURL: docUrl,

                    version: 1,


                    // IMPORTANT
                    status: "draft",


                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp(),

                }
            );


            navigate("/student/proposals");


        } catch (error) {

            console.error(
                "Error saving draft:",
                error
            );

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


                <input
                    className="w-full border rounded p-2"
                    placeholder="Proposal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />



                <textarea
                    className="w-full border rounded p-2"
                    rows={4}
                    placeholder="Abstract (Summary)"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    required
                />



                <textarea
                    className="w-full border rounded p-2"
                    rows={4}
                    placeholder="Problem Statement (Summary)"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    required
                />



                <textarea
                    className="w-full border rounded p-2"
                    rows={4}
                    placeholder="Objectives (Summary)"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    required
                />



                <textarea
                    className="w-full border rounded p-2"
                    rows={4}
                    placeholder="Methodology (Summary)"
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    required
                />



                <textarea
                    className="w-full border rounded p-2"
                    rows={4}
                    placeholder="Expected Outcome (Summary)"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    required
                />



                <input
                    className="w-full border rounded p-2"
                    placeholder="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                />



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



                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach Complete Proposal Document (PDF, Word)
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full border rounded p-2 bg-white text-sm"
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >

                    {
                        loading
                            ? "Saving..."
                            : "Save Draft"
                    }

                </button>


            </form>


        </div>

    );

}