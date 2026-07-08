import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { ActivityActor } from "./activityService";

export interface Comment {
    id: string;
    proposalId: string;
    authorId: string;
    authorName: string;
    authorRole: "student" | "supervisor" | "admin";
    text: string;
    createdAt: any;
}

/**
 * Saves a new comment to Firestore
 */
export async function saveComment(
    proposalId: string,
    text: string,
    actor: ActivityActor
) {
    if (!text.trim()) return;

    await addDoc(collection(db, "comments"), {
        proposalId,
        authorId: actor.uid,
        authorName: actor.name,
        authorRole: actor.role,
        text: text.trim(),
        createdAt: serverTimestamp()
    });
}

/**
 * Subscribes to changes in comments for a specific proposal
 */
export function subscribeComments(
    proposalId: string,
    onUpdate: (comments: Comment[]) => void
) {
    const q = query(
        collection(db, "comments"),
        where("proposalId", "==", proposalId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const comments: Comment[] = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Comment, "id">)
                }))
                // Sort client-side oldest-first (avoids needing a Firestore composite index)
                .sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() ?? 0;
                    const bTime = b.createdAt?.toMillis?.() ?? 0;
                    return aTime - bTime;
                });
            onUpdate(comments);
        },
        (error) => {
            console.error("Comments subscription error:", error);
        }
    );
}
