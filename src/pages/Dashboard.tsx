import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

/**
 * DASHBOARD PAGE
 * - Shows after login
 * - Displays user info
 * - Allows logout
 */
export default function Dashboard() {
    const { user } = useAuth();

    /**
     * LOGOUT USER
     */
    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">

            <h1 className="text-2xl font-bold text-blue-600">
                AcaTrack Dashboard
            </h1>

            <p>
                Welcome: {user?.email}
            </p>

            <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2"
            >
                Logout
            </button>
        </div>
    );
}