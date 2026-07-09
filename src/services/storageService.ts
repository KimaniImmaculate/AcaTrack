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

/**
 * Uploads a user profile photo to Firebase Storage
 * under profile_photos/{userId}/{timestamp}_{filename}
 * 
 * @param userId The UID of the user uploading the photo
 * @param file The File object selected from the input
 * @returns The public download URL of the uploaded image
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileRef = ref(storage, `profile_photos/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
}

