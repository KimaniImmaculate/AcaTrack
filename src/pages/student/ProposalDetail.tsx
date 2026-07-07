import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";

export default function ProposalDetail() {

    const { id } = useParams();

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        if (!id) return;

        const unsubscribe = onSnapshot(
            doc(db, "proposals", id),
            (snapshot) => {

                if (snapshot.exists()) {

                    setProposal({
                        id: snapshot.id,
                        ...(snapshot.data() as Omit<Proposal, "id">),
                    });

                }

                setLoading(false);
            }
        );


        return () => unsubscribe();

    }, [id]);


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

            <h1 className="text-2xl font-bold mb-4">
                {proposal.title}
            </h1>


            <div className="mb-4">
                <StatusBadge status={proposal.status} />
            </div>


            <div className="space-y-6">


                <section>
                    <h2 className="font-semibold">
                        Department
                    </h2>

                    <p>
                        {proposal.department}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Abstract
                    </h2>

                    <p>
                        {proposal.abstract}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Problem Statement
                    </h2>

                    <p>
                        {proposal.problemStatement}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Objectives
                    </h2>

                    <p>
                        {proposal.objectives}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Methodology
                    </h2>

                    <p>
                        {proposal.methodology}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Expected Outcome
                    </h2>

                    <p>
                        {proposal.expectedOutcome}
                    </p>
                </section>



                <section>
                    <h2 className="font-semibold">
                        Version
                    </h2>

                    <p>
                        {proposal.version}
                    </p>
                </section>


            </div>

        </div>

    );
}