import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    updateDoc
} from "firebase/firestore";

import DashboardLayout from "../layouts/DashboardLayout";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

interface Notification {
    id: string;
    title: string;
    message: string;
    read?: boolean;
    createdAt?: any;
    type?: string;
}

const notificationTypeIcon = (type?: string) => {
    switch (type) {
        case "submission":
            return (
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        case "approval":
            return (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "revision":
            return (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case "rejection":
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return (
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            );
    }
};

const notificationTypeBg = (type?: string) => {
    switch (type) {
        case "submission": return "bg-amber-50";
        case "approval": return "bg-emerald-50";
        case "revision": return "bg-amber-50";
        case "rejection": return "bg-red-50";
        default: return "bg-slate-50";
    }
};

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setNotifications(
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[]
            );
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const markAllRead = async () => {
        if (!user) return;
        const unread = notifications.filter(n => !n.read);
        await Promise.all(
            unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true }))
        );
    };

    const markRead = async (notifId: string) => {
        await updateDoc(doc(db, "notifications", notifId), { read: true });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-850 tracking-tight">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-slate-400 text-sm font-medium mt-0.5">
                                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-blue-300 px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-semibold text-sm">You're all caught up!</p>
                        <p className="text-slate-400 text-xs mt-1">No notifications to display.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => { if (!notification.read) markRead(notification.id); }}
                                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                                    notification.read ? "border-slate-200/80" : "border-amber-200/80 ring-1 ring-blue-100"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${notificationTypeBg(notification.type)} flex items-center justify-center shrink-0`}>
                                        {notificationTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 justify-between">
                                            <h3 className="font-bold text-slate-800 text-sm leading-snug">
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        {notification.createdAt?.toDate && (
                                            <p className="text-slate-350 text-[10px] font-medium mt-2">
                                                {notification.createdAt.toDate().toLocaleDateString("en-US", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}{" "}
                                                •{" "}
                                                {notification.createdAt.toDate().toLocaleTimeString("en-US", {
                                                    hour: "numeric", minute: "2-digit"
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}