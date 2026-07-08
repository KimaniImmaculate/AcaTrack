import { useEffect, useState } from "react";
import ActivityTimeline from "../../components/ActivityTimeline";
import CommentsList from "../../components/CommentsList";

import {
    doc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";

import {
    useParams
} from "react-router-dom";


import { db } from "../../services/firebase";

import {
    Proposal
} from "../../types/Proposal";

import { UserProfile } from "../../types/User";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import {
    submitProposal,
    resubmitProposal
} from "../../services/proposalWorkflow";
import { uploadProposalDocument } from "../../services/storageService";



export default function ProposalDetail() {

    const { user, profile } = useAuth();
    const { id } = useParams();


    const [proposal, setProposal]
        =
        useState<Proposal | null>(null);


    const [loading, setLoading]
        =
        useState(true);

    const [supervisor, setSupervisor]
        =
        useState<UserProfile | null | "not_found">(null);

    const [file, setFile] = useState<File | null>(null);
    const [responseText, setResponseText] = useState("");
    const [editing, setEditing]
        =
        useState(false);



    const [form, setForm]
        =
        useState({

            title: "",
            abstract: "",
            problemStatement: "",
            objectives: "",
            methodology: "",
            expectedOutcome: "",
            department: ""


        });




    // Fetch supervisor profile whenever proposal's supervisorId changes
    useEffect(() => {

        const sid = proposal?.supervisorId;
        if (!sid) {
            setSupervisor(null);
            return;
        }

        getDoc(doc(db, "users", sid))
            .then((snap) => {
                if (snap.exists()) {
                    setSupervisor({ id: snap.id, ...snap.data() } as UserProfile);
                } else {
                    setSupervisor("not_found");
                }
            })
            .catch(() => setSupervisor("not_found"));

    }, [proposal?.supervisorId]);


    // Fetch proposal snapshot
    useEffect(() => {

        if (!id) return;


        const unsubscribe =
            onSnapshot(
                doc(db, "proposals", id),
                (snapshot) => {


                    if (snapshot.exists()) {


                        const data = {

                            id: snapshot.id,

                            ...(snapshot.data() as Omit<Proposal, "id">)

                        };


                        setProposal(data);



                        setForm({

                            title: data.title,

                            abstract: data.abstract,

                            problemStatement: data.problemStatement,

                            objectives: data.objectives,

                            methodology: data.methodology,

                            expectedOutcome: data.expectedOutcome,

                            department: data.department

                        });


                    }


                    setLoading(false);


                }
            );


        return () => unsubscribe();


    }, [id]);





    const saveChanges = async () => {


        if (!proposal) return;

        setLoading(true);

        try {
            let docUrl = proposal.documentURL || "";
            if (file) {
                docUrl = await uploadProposalDocument(proposal.studentId, file);
            }

            await updateDoc(
                doc(db, "proposals", proposal.id),
                {
                    ...form,
                    documentURL: docUrl,
                    updatedAt: serverTimestamp()
                }
            );

            setEditing(false);
            setFile(null);
        } catch (error) {
            console.error("Error saving proposal changes:", error);
            alert("Failed to save changes.");
        } finally {
            setLoading(false);
        }

    };







    if (loading) {

        return (

            <div className="p-6">
                Loading proposal...
            </div>

        );

    }





    if (!proposal) {

        return (

            <div className="p-6">
                Proposal not found.
            </div>

        );

    }







    return (

        <div className="p-6 max-w-4xl mx-auto">


            {
                editing ? (

                    <input

                        className="border p-2 w-full text-2xl font-bold rounded"

                        value={form.title}

                        onChange={(e) =>

                            setForm({

                                ...form,

                                title: e.target.value

                            })

                        }

                    />


                ) : (


                    <h1 className="text-2xl font-bold">

                        {proposal.title}

                    </h1>


                )

            }





            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                <StatusBadge status={proposal.status} />
                {proposal.updatedAt?.toDate && (
                    <span className="text-xs text-gray-400">
                        Last updated:{" "}
                        {proposal.updatedAt.toDate().toLocaleDateString("en-US", {
                            day: "numeric", month: "long", year: "numeric"
                        })}{" "}
                        •{" "}
                        {proposal.updatedAt.toDate().toLocaleTimeString("en-US", {
                            hour: "numeric", minute: "2-digit"
                        })}
                    </span>
                )}
            </div>


            {/* Supervisor info for the student */}
            <div className="mt-4 p-4 bg-gray-50 border rounded text-sm space-y-1">
                <p className="font-semibold text-gray-700 mb-1">Assigned Supervisor</p>
                {proposal.supervisorId ? (
                    supervisor === null ? (
                        <p className="text-gray-400">Loading supervisor details...</p>
                    ) : supervisor === "not_found" ? (
                        <p className="text-gray-500">Details not found</p>
                    ) : (
                        <>
                            <p>
                                <span className="font-medium text-gray-600">Name: </span>
                                {supervisor.firstName} {supervisor.lastName}
                            </p>
                            <p>
                                <span className="font-medium text-gray-600">Department: </span>
                                {supervisor.department ?? "Details not found"}
                            </p>
                        </>
                    )
                ) : (
                    <p className="text-gray-400">No supervisor assigned yet.</p>
                )}
            </div>


            {/* Complete Proposal Document for the student */}
            <div className="mt-4 p-4 bg-gray-50 border rounded text-sm space-y-1">
                <p className="font-semibold text-gray-700 mb-1">Complete Proposal Document</p>
                {proposal.documentURL ? (
                    <a
                        href={proposal.documentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline gap-1 mt-1 font-medium"
                    >
                        📄 View Complete Proposal Document
                    </a>
                ) : (
                    <p className="text-gray-400">No document attached yet.</p>
                )}
            </div>

            {editing && (
                <div className="mt-4 p-4 border border-dashed rounded bg-yellow-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload New Complete Proposal Document (PDF, Word)
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full border rounded p-2 bg-white text-sm"
                    />
                </div>
            )}






            <div className="mt-4 flex gap-3 flex-wrap">



                {
                    (proposal.status === "draft" ||
                        proposal.status === "revision_requested")
                    &&

                    !editing &&

                    (

                        <button

                            onClick={() => setEditing(true)}

                            className="bg-yellow-500 text-white px-4 py-2 rounded"

                        >

                            Edit Proposal

                        </button>

                    )

                }




                {
                    editing &&

                    (

                        <button

                            onClick={saveChanges}

                            className="bg-green-600 text-white px-4 py-2 rounded"

                        >

                            Save Changes

                        </button>

                    )

                }





                {
                    proposal.status === "draft" &&

                    (

                        <button

                            onClick={() => {
                                if (!user) return;
                                submitProposal(proposal, {
                                    uid: user.uid,
                                    name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Student",
                                    role: "student"
                                });
                            }}

                            className="bg-blue-600 text-white px-4 py-2 rounded"

                        >

                            Submit Proposal

                        </button>

                    )

                }





                {
                    proposal.status === "revision_requested" &&

                    (

                        <div className="w-full mt-4 p-4 border rounded bg-purple-50/20 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Explain how you resolved the comments
                            </label>
                            <textarea
                                className="w-full border rounded p-2 text-sm bg-white"
                                rows={3}
                                placeholder="E.g., Updated the methodology details and clarified expected outcomes..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                            />
                            <button
                                onClick={async () => {
                                    if (!user) return;
                                    setLoading(true);
                                    try {
                                        await resubmitProposal(
                                            proposal,
                                            {
                                                uid: user.uid,
                                                name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Student",
                                                role: "student"
                                            },
                                            responseText
                                        );
                                        setResponseText("");
                                    } catch (error) {
                                        console.error("Resubmit error:", error);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="bg-purple-600 text-white px-4 py-2 rounded font-medium hover:bg-purple-700 transition-colors"
                            >
                                Resubmit with Resolved Comments
                            </button>
                        </div>

                    )

                }



            </div>







            <div className="space-y-6 mt-8">





                <EditableField
                    label="Department"
                    editing={editing}
                    value={form.department}
                    display={proposal.department}
                    onChange={(v) =>
                        setForm({
                            ...form,
                            department: v
                        })
                    }
                />




                <EditableField

                    label="Abstract (Summary)"

                    editing={editing}

                    value={form.abstract}

                    display={proposal.abstract}

                    onChange={(v) =>

                        setForm({

                            ...form,

                            abstract: v

                        })

                    }

                />





                <EditableField

                    label="Problem Statement (Summary)"

                    editing={editing}

                    value={form.problemStatement}

                    display={proposal.problemStatement}

                    onChange={(v) =>

                        setForm({

                            ...form,

                            problemStatement: v

                        })

                    }

                />





                <EditableField

                    label="Objectives (Summary)"

                    editing={editing}

                    value={form.objectives}

                    display={proposal.objectives}

                    onChange={(v) =>

                        setForm({

                            ...form,

                            objectives: v

                        })

                    }

                />





                <EditableField

                    label="Methodology (Summary)"

                    editing={editing}

                    value={form.methodology}

                    display={proposal.methodology}

                    onChange={(v) =>

                        setForm({

                            ...form,

                            methodology: v

                        })

                    }

                />





                <EditableField

                    label="Expected Outcome (Summary)"

                    editing={editing}

                    value={form.expectedOutcome}

                    display={proposal.expectedOutcome}

                    onChange={(v) =>

                        setForm({

                            ...form,

                            expectedOutcome: v

                        })

                    }

                />





                <Field

                    label="Version"

                    value={String(proposal.version)}

                />



            </div>

            <CommentsList proposalId={proposal.id} />

            <ActivityTimeline proposalId={proposal.id} />


        </div>

    );

}





function Field({

    label,

    value

}: {

    label: string;

    value: string;

}) {


    return (

        <div>

            <b>{label}</b>

            <p>{value}</p>

        </div>

    );

}







function EditableField({

    label,

    editing,

    value,

    display,

    onChange

}: {

    label: string;

    editing: boolean;

    value: string;

    display: string;

    onChange: (v: string) => void;

}) {


    return (

        <div>

            <b>{label}</b>


            {

                editing ?


                    <textarea

                        className="border p-2 w-full rounded"

                        rows={4}

                        value={value}

                        onChange={(e) =>

                            onChange(e.target.value)

                        }

                    />


                    :

                    <p>{display}</p>


            }


        </div>

    );


}