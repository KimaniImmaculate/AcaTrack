import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    doc,
    updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


interface Notification {

    id: string;
    title: string;
    message: string;
    proposalId?: string;
    type?: string;
    read: boolean;
    createdAt?: any;

}



export default function NotificationBell() {


    const { user, role } = useAuth();

    const navigate = useNavigate();


    const [notifications, setNotifications] =
        useState<Notification[]>([]);


    const [open, setOpen] =
        useState(false);




    useEffect(() => {


        if (!user) return;



        const q = query(

            collection(db, "notifications"),

            where(
                "recipientId",
                "==",
                user.uid
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );



        const unsubscribe = onSnapshot(
            q,
            snapshot => {


                const data =
                    snapshot.docs.map(doc => ({

                        id: doc.id,

                        ...(doc.data() as Omit<
                            Notification,
                            "id"
                        >)

                    }));


                setNotifications(data);


            }

        );



        return () => unsubscribe();


    }, [user]);






    const unread =
        notifications.filter(
            n => !n.read
        ).length;





    const markRead = async (
        notification: Notification
    ) => {

        await updateDoc(
            doc(
                db,
                "notifications",
                notification.id
            ),
            {
                read: true
            }
        );


        // Meeting request notification
        if (
            notification.type === "meeting_request" &&
            role === "supervisor"
        ) {

            navigate("/supervisor/meeting-requests");

            return;
        }



        // Normal proposal notifications
        if (notification.proposalId) {


            const path =
                role === "supervisor"
                    ? `/supervisor/proposals/${notification.proposalId}`
                    : role === "admin"
                        ? `/admin/proposals/${notification.proposalId}`
                        : `/student/proposals/${notification.proposalId}`;


            navigate(path);

        }

    };







    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all active:scale-95 duration-200"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white ring-2 ring-white">
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-slate-200/85 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 font-bold text-slate-800 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm">Notifications</span>
                        {unread > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                {unread} unread
                            </span>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <p className="p-6 text-center text-xs text-slate-400 font-medium">
                                No new notifications
                            </p>
                        ) : (
                            notifications.slice(0, 5).map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => markRead(notification)}
                                    className={`p-4 cursor-pointer text-left transition-colors duration-200 hover:bg-slate-50 ${notification.read ? "bg-white" : "bg-amber-50/40"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );

}