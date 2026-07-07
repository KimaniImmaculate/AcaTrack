import {
    doc,
    updateDoc,
    serverTimestamp,
    increment
} from "firebase/firestore";

import { db } from "./firebase";
import { createNotification } from "./notifications";
import { createActivity } from "./activityService";
import { Proposal } from "../types/Proposal";



export async function submitProposal(
    proposal: Proposal
) {

    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "submitted",
            updatedAt: serverTimestamp()
        }
    );


    await createActivity(
        proposal.id,
        "Student submitted proposal for review."
    );



    if (proposal.supervisorId) {


        await createNotification(
            proposal.supervisorId,
            proposal.id,
            "New Proposal Submitted",
            "A student has submitted a proposal for your review."
        );


    }

}







export async function startReview(
    proposal: Proposal
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "under_review",
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        "Supervisor started reviewing the proposal."
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Under Review",
        "Your supervisor has started reviewing your proposal."
    );

}







export async function requestRevision(
    proposal: Proposal
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "revision_requested",
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        "Supervisor requested revisions."
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Revision Requested",
        "Your supervisor requested changes to your proposal."
    );

}







export async function approveProposal(
    proposal: Proposal
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "approved",
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        "Proposal approved."
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Approved",
        "Congratulations! Your proposal has been approved."
    );


}







export async function rejectProposal(
    proposal: Proposal
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "rejected",
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        "Proposal rejected."
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Rejected",
        "Unfortunately your proposal was rejected."
    );


}







export async function resubmitProposal(
    proposal: Proposal
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "resubmitted",
            version: increment(1),
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        "Student resubmitted proposal."
    );



    if (proposal.supervisorId) {


        await createNotification(
            proposal.supervisorId,
            proposal.id,
            "Proposal Resubmitted",
            "A student has submitted a revised proposal."
        );


    }

}







export async function assignSupervisor(
    proposal: Proposal,
    supervisorId: string | null
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            supervisorId,
            updatedAt: serverTimestamp()
        }
    );



    await createActivity(
        proposal.id,
        supervisorId
            ?
            "Supervisor assigned."
            :
            "Supervisor removed."
    );



    if (supervisorId) {


        await createNotification(
            supervisorId,
            proposal.id,
            "New Proposal Assigned",
            "A proposal has been assigned to you."
        );


    }


}