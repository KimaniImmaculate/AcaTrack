import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { UserProfile } from "../types/User";

type AuthContextType = {
    user: any;
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
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [role, setRole] = useState<AuthContextType["role"]>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubProfile: (() => void) | undefined;

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);

            if (unsubProfile) {
                unsubProfile();
                unsubProfile = undefined;
            }

            if (!firebaseUser) {
                setProfile(null);
                setRole(null);
                setLoading(false);
                return;
            }

            const ref = doc(db, "users", firebaseUser.uid);
            unsubProfile = onSnapshot(ref, (snap) => {
                if (snap.exists()) {
                    const data = snap.data() as UserProfile;
                    setProfile({ ...data, id: snap.id });
                    setRole(data.role);
                } else {
                    setProfile(null);
                    setRole(null);
                }
                setLoading(false);
            }, (err) => {
                console.error("Error listening to user profile:", err);
                setLoading(false);
            });
        });

        return () => {
            unsubscribe();
            if (unsubProfile) unsubProfile();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);