import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

/**
 * TYPE: what the auth system provides globally
 */
type AuthContextType = {
    user: User | null;
    loading: boolean;
    role: string | null;
};

/**
 * CREATE CONTEXT (default fallback values)
 */
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
});

/**
 * AUTH PROVIDER
 * Wraps the entire app and provides auth + role state
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // fetch role from Firestore
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRole(docSnap.data().role);
                } else {
                    setRole(null);
                }
            } else {
                setRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * CUSTOM HOOK
 * Used anywhere in the app to access auth state
 */
export const useAuth = () => useContext(AuthContext);