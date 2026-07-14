import {
    addDoc,
    collection,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";


export async function createNotification(
    recipientId: string,
    proposalId: string,
    title: string,
    message: string,
    type: string = "general"
) {

    if (!recipientId) return;


    await addDoc(
        collection(db, "notifications"),
        {

            recipientId,

            proposalId,

            title,

            message,

            type,

            read: false,

            createdAt: serverTimestamp()

        }
    );

}