import {
    addDoc,
    collection,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export interface ActivityActor {
    uid: string;
    name: string;
    role: "student" | "supervisor" | "admin";
}

export async function createActivity(
    proposalId: string,
    message: string,
    actor: ActivityActor
) {
    await addDoc(
        collection(db, "activities"),
        {
            proposalId,
            message,

            actor,

            createdAt: serverTimestamp(),
        }
    );
}