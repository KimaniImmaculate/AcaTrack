import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";

/**
 * TYPE: defines what our auth context provides
 * - user: current logged-in Firebase user (or null)
 * - loading: whether Firebase is still checking auth state
 */
type AuthContextType = {
    user: User | null;
    loading: boolean;
};

/**
 * CREATE CONTEXT
 * Default values used only before Firebase initializes
 */
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

/**
 * PROVIDER COMPONENT
 * Wraps the entire app so all components can access auth state
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /**
         * LISTEN TO AUTH CHANGES
         * Firebase automatically tells us when user logs in/out
         */
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        // cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * CUSTOM HOOK
 * Makes it easy to access auth state anywhere in the app
 */
export const useAuth = () => useContext(AuthContext);