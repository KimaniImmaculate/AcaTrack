import { useEffect, useState } from "react";

import {
    doc,
    onSnapshot,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    useParams
} from "react-router-dom";


import { db } from "../../services/firebase";

import {
    Proposal
} from "../../types/Proposal";

import StatusBadge from "../../components/StatusBadge";


import {
    submitProposal,
    resubmitProposal
} from "../../services/proposalWorkflow";



export default function ProposalDetail() {


    const { id } = useParams();


    const [proposal, setProposal]
        =
        useState<Proposal | null>(null);


    const [loading, setLoading]
        =
        useState(true);


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
            expectedOutcome: ""

        });




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

                            expectedOutcome: data.expectedOutcome

                        });


                    }


                    setLoading(false);


                }
            );


        return () => unsubscribe();


    }, [id]);





    const saveChanges = async () => {


        if (!proposal) return;



        await updateDoc(

            doc(db, "proposals", proposal.id),

            {

                ...form,

                updatedAt: serverTimestamp()

            }

        );


        setEditing(false);


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





            <div className="mt-3">

                <StatusBadge status={proposal.status} />

            </div>






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

                            onClick={() => submitProposal(proposal)}

                            className="bg-blue-600 text-white px-4 py-2 rounded"

                        >

                            Submit Proposal

                        </button>

                    )

                }





                {
                    proposal.status === "revision_requested" &&

                    (

                        <button

                            onClick={() => resubmitProposal(proposal)}

                            className="bg-purple-600 text-white px-4 py-2 rounded"

                        >

                            Resubmit Proposal

                        </button>

                    )

                }



            </div>







            <div className="space-y-6 mt-8">





                <Field

                    label="Department"

                    value={proposal.department}

                />





                <EditableField

                    label="Abstract"

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

                    label="Problem Statement"

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

                    label="Objectives"

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

                    label="Methodology"

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

                    label="Expected Outcome"

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