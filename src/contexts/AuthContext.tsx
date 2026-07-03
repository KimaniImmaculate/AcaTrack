import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { UserProfile } from "../types/User";

type AuthContextType = {
    user: User | null;
    profile: UserProfile | null;
    role: "student" | "supervisor" | "admin" | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    role: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [role, setRole] = useState<AuthContextType["role"]>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (!firebaseUser) {
                setProfile(null);
                setRole(null);
                setLoading(false);
                return;
            }

            const ref = doc(db, "users", firebaseUser.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data() as UserProfile;
                setProfile(data);
                setRole(data.role);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);