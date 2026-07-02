import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC ROUTE
 * ------------
 * Prevents logged-in users from accessing:
 * - Login
 * - Register
 *
 * If user is logged in → redirect to their dashboard.
 */
export default function PublicRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, role } = useAuth();

    // Wait for Firebase auth to initialize
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    // If user is logged in, redirect based on role
    if (user) {
        switch (role) {
            case "student":
                return <Navigate to="/student" replace />;

            case "supervisor":
                return <Navigate to="/supervisor" replace />;

            case "admin":
                return <Navigate to="/admin" replace />;

            default:
                return <Navigate to="/login" replace />;
        }
    }

    // If not logged in → allow access
    return <>{children}</>;
}