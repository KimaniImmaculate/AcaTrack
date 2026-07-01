import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA0xFsUQ-N9FzKCjjl59h1rkVJ4T1nX7B4",
    authDomain: "acatrack.firebaseapp.com",
    projectId: "acatrack",
    storageBucket: "acatrack.firebasestorage.app",
    messagingSenderId: "456001073295",
    appId: "1:456001073295:web:1643caef4ac1044351c0fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);