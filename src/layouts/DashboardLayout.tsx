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
        <div className="min-h-screen flex bg-slate-50">

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 p-6 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-8 px-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="bg-gradient-to-tr from-amber-500 to-yellow-600 p-1.5 rounded-lg text-white shadow-md shadow-amber-500/10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            {/* Graduation Cap Top */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L21 7 L12 11 L3 7 Z" />
                            {/* Cap base */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5 V12.5 C7 14.5, 17 14.5, 17 12.5 V8.5" />
                            {/* Chart track line with arrow */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19 L10 14 L14 16 L19 11 M15 11 H19 V15" />
                        </svg>
                    </div>
                    <span className="text-lg font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                        AcaTrack
                    </span>
                </div>

                {/* Profile Card */}
                <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-slate-850 border border-slate-800/60 shadow-inner cursor-pointer hover:bg-slate-800 transition-colors group"
                >
                    {profile?.photoURL ? (
                        <img
                            src={profile.photoURL}
                            alt="Avatar"
                            className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white flex items-center justify-center font-extrabold uppercase shadow-sm group-hover:scale-105 transition-transform">
                            {profile?.firstName?.[0] || role?.[0] || "?"}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate leading-snug group-hover:text-amber-400 transition-colors">
                            {profile
                                ? `${profile.prefix ? `${profile.prefix} ` : ""}${profile.firstName} ${profile.lastName}`
                                : "Loading..."}
                        </p>
                        <span className="text-[9px] font-extrabold tracking-wider text-amber-400 uppercase">
                            {role}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5 flex-1">
                    {menuItems.map((item) => {
                        const isActive = window.location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-250 flex items-center gap-3 ${
                                    isActive
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/10"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-8 py-4 flex justify-between items-center">
                    <div className="text-sm font-bold text-slate-850 flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                            {role} Portal
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 duration-200 cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>

            </div>
        </div>
    );
}