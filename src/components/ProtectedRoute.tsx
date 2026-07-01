import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

/**
 * PROTECTED ROUTE WRAPPER
 * -----------------------
 * This component controls access to pages.
 *
 * It checks:
 * 1. Is user logged in?
 * 2. Does user have correct role?
 *
 * If NOT → redirect away
 * If YES → allow access
 */

type Props = {
    children: ReactNode;
    allowedRoles: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, role, loading } = useAuth();

    /**
     * WAIT FOR FIREBASE AUTH CHECK
     * (prevents flickering redirects)
     */
    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    /**
     * RULE 1: NOT LOGGED IN
     * Redirect to login page
     */
    if (!user) {
        return <Navigate to="/login" />;
    }

    /**
     * RULE 2: ROLE NOT ALLOWED
     * Example: student trying to access admin page
     */
    if (!allowedRoles.includes(role || "")) {
        return <Navigate to="/" />;
    }

    /**
     * RULE 3: ACCESS GRANTED
     * Render the page
     */
    return <>{children}</>;
}