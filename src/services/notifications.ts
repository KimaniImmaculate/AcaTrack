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
    message: string
) {
    if (!recipientId) return;

    await addDoc(collection(db, "notifications"), {
        recipientId,
        proposalId,
        title,
        message,
        read: false,
        createdAt: serverTimestamp()
    });
}