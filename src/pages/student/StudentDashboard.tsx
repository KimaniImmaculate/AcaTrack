import StatCard from "../../components/dashboard/StatCard";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";

/**
 * STUDENT DASHBOARD
 * -----------------
 * Home page shown after a student logs in.
 *
 * For now, statistics are hardcoded.
 * Later, they will come from Firestore.
 */
export default function StudentDashboard() {
    // Used to navigate between pages
    const navigate = useNavigate();

    /**
     * HANDLE LOGOUT
     * -------------
     * Signs the current user out of Firebase
     * and redirects them back to the login page.
     */
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-blue-600">
                        Welcome back 👋
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage your research proposals from one place.
                    </p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Logout
                </button>

            </div>

            {/* Statistics */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Total Proposals"
                    value={0}
                />

                <StatCard
                    title="Drafts"
                    value={0}
                />

                <StatCard
                    title="Under Review"
                    value={0}
                />

                <StatCard
                    title="Approved"
                    value={0}
                />

            </div>

            {/* Quick Actions */}
            <div className="mt-10">

                <h2 className="text-xl font-semibold">
                    Quick Actions
                </h2>

                <div className="mt-4 flex flex-wrap gap-4">

                    <button className="rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                        New Proposal
                    </button>

                    <button className="rounded border px-5 py-3 hover:bg-gray-100">
                        My Proposals
                    </button>

                    <button className="rounded border px-5 py-3 hover:bg-gray-100">
                        Notifications
                    </button>

                </div>
            </div>

        </div>
    );
}