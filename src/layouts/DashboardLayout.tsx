import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { sidebarConfig } from "../config/sidebarConfig";
import NotificationBell from "../components/NotificationBell";
import Logo from "../components/Logo";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { profile, role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    const menuItems =
        role && sidebarConfig[role as keyof typeof sidebarConfig]
            ? sidebarConfig[role as keyof typeof sidebarConfig]
            : [];

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="mb-8 flex justify-center cursor-pointer" onClick={() => navigate("/")}>
                <Logo variant="light" size="md" />
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
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-250 flex items-center gap-3 ${
                                isActive
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/10"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Mobile logout at bottom of drawer */}
            <div className="lg:hidden pt-6 mt-6 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                    Log Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-slate-50">

            {/* ── DESKTOP SIDEBAR (always visible ≥ lg) ── */}
            <aside className="hidden lg:flex w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-100 p-6 flex-col">
                <SidebarContent />
            </aside>

            {/* ── MOBILE OFF-CANVAS DRAWER ── */}
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer panel */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 text-slate-100 p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <SidebarContent />
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0">

                <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            aria-label="Open menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                            {role} Portal
                        </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <NotificationBell />
                        <button
                            onClick={handleLogout}
                            className="hidden sm:block text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 duration-200 cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
                    {!["/student", "/supervisor", "/admin"].includes(location.pathname) && (
                        <button
                            onClick={() => navigate(role ? `/${role}` : "/")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-600 transition-colors mb-6 cursor-pointer group"
                        >
                            <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Return to Dashboard
                        </button>
                    )}
                    {children}
                </main>

            </div>
        </div>
    );
}