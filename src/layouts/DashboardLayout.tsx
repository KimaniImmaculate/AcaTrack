import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { sidebarConfig } from "../config/sidebarConfig";
import NotificationBell from "../components/NotificationBell";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { profile, role } = useAuth();
    const navigate = useNavigate();

    const menuItems =
        role && sidebarConfig[role as keyof typeof sidebarConfig]
            ? sidebarConfig[role as keyof typeof sidebarConfig]
            : [];

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* SIDEBAR */}
            <aside className="w-64 bg-blue-700 text-white p-6">
                <h1 className="text-2xl font-bold mb-8">
                    AcaTrack
                </h1>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full text-left p-2 rounded hover:bg-blue-600"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col">

                <header className="bg-white shadow p-4 flex justify-between items-center">

                    <div className="text-sm text-gray-600">
                        Welcome,{" "}
                        {profile
                            ? `${profile.firstName} ${profile.lastName}`
                            : "Loading..."}
                    </div>


                    <div className="flex items-center gap-6">

                        <NotificationBell />


                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Logout
                        </button>

                    </div>


                </header>

                {/* PAGE CONTENT */}
                <main className="p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}