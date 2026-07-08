import {
    doc,
    updateDoc,
    serverTimestamp,
    increment
} from "firebase/firestore";

import { db } from "./firebase";
import { createNotification } from "./notifications";
import { createActivity, ActivityActor } from "./activityService";
import { Proposal } from "../types/Proposal";
import { saveComment } from "./commentService";



export async function submitProposal(
    proposal: Proposal,
    actor: ActivityActor
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
        "submitted the proposal for review.",
        actor
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
    proposal: Proposal,
    actor: ActivityActor
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
        "started reviewing the proposal.",
        actor
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Under Review",
        "Your supervisor has started reviewing your proposal."
    );

}







export async function requestRevision(
    proposal: Proposal,
    actor: ActivityActor,
    commentsText?: string
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "revision_requested",
            updatedAt: serverTimestamp()
        }
    );

    if (commentsText && commentsText.trim()) {
        await saveComment(proposal.id, commentsText, actor);
    }

    await createActivity(
        proposal.id,
        "requested revisions and sent comments.",
        actor
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Revision Requested",
        "Revisions requested. Please review the comments and resubmit."
    );

}







export async function approveProposal(
    proposal: Proposal,
    actor: ActivityActor
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
        "approved the proposal.",
        actor
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Approved",
        "Congratulations! Your proposal has been approved."
    );


}







export async function rejectProposal(
    proposal: Proposal,
    actor: ActivityActor
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
        "rejected the proposal.",
        actor
    );



    await createNotification(
        proposal.studentId,
        proposal.id,
        "Proposal Rejected",
        "Unfortunately your proposal was rejected."
    );


}







export async function resubmitProposal(
    proposal: Proposal,
    actor: ActivityActor,
    responseText?: string
) {


    await updateDoc(
        doc(db, "proposals", proposal.id),
        {
            status: "resubmitted",
            version: increment(1),
            updatedAt: serverTimestamp()
        }
    );

    if (responseText && responseText.trim()) {
        await saveComment(proposal.id, responseText, actor);
    }

    await createActivity(
        proposal.id,
        "resubmitted the proposal with resolved comments.",
        actor
    );



    if (proposal.supervisorId) {


        await createNotification(
            proposal.supervisorId,
            proposal.id,
            "Proposal Resubmitted",
            "The student has resubmitted with resolved comments."
        );


    }

}







export async function assignSupervisor(
    proposal: Proposal,
    supervisorId: string | null,
    supervisorName: string | null,
    actor: ActivityActor
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
            ? `assigned ${supervisorName} as supervisor.`
            : "removed the supervisor.",
        actor
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