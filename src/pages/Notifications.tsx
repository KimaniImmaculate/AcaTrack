import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from "firebase/firestore";

import DashboardLayout from "../layouts/DashboardLayout";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Notifications() {

    const { user } = useAuth();

    const [notifications, setNotifications] = useState<any[]>([]);

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
                }))
            );

        });

        return () => unsub();

    }, [user]);

    return (

        <DashboardLayout>

            <div className="p-6">

                <h1 className="text-2xl font-bold mb-6">
                    Notifications
                </h1>

                {notifications.length === 0 ? (

                    <p>No notifications.</p>

                ) : (

                    notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className="border rounded p-4 mb-3 bg-white"
                        >
                            <h3 className="font-semibold">
                                {notification.title}
                            </h3>

                            <p>{notification.message}</p>

                        </div>

                    ))

                )}

            </div>

        </DashboardLayout>

    );

}