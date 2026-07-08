import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a proposal document to Firebase Storage
 * under proposals/{studentId}/{timestamp}_{filename}
 * 
 * @param studentId The UID of the student uploading the file
 * @param file The File object selected from the input
 * @returns The public download URL of the uploaded document
 */
export async function uploadProposalDocument(studentId: string, file: File): Promise<string> {
    const fileRef = ref(storage, `proposals/${studentId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
}
