import StatCard from "../../components/dashboard/StatCard";

/**
 * STUDENT DASHBOARD
 * -----------------
 * Home page shown after a student logs in.
 *
 * For now, statistics are hardcoded.
 * Later, they will come from Firestore.
 */
export default function StudentDashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Page title */}
            <h1 className="text-3xl font-bold text-blue-600">
                Welcome back 👋
            </h1>

            <p className="mt-2 text-gray-600">
                Manage your research proposals from one place.
            </p>

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

            {/* Quick actions */}
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