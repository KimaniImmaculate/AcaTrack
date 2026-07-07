import {
    addDoc,
    collection,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";


export async function createActivity(
    proposalId: string,
    message: string
) {

    await addDoc(
        collection(db, "activities"),
        {
            proposalId,
            message,
            createdAt: serverTimestamp(),
        }
    );

}