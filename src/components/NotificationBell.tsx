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
    read: boolean;
    createdAt?: any;

}



export default function NotificationBell() {


    const { user } = useAuth();

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


        if (notification.proposalId) {

            navigate(
                `/student/proposals/${notification.proposalId}`
            );

        }


    };







    return (

        <div className="relative">


            <button

                onClick={() =>
                    setOpen(!open)
                }

                className="relative text-2xl"

            >

                🔔


                {unread > 0 && (

                    <span
                        className="
                        absolute
                        -top-2
                        -right-2
                        bg-red-600
                        text-white
                        text-xs
                        rounded-full
                        px-2
                        "
                    >

                        {unread}

                    </span>

                )}


            </button>






            {open && (

                <div
                    className="
                    absolute
                    right-0
                    mt-3
                    w-80
                    bg-white
                    border
                    rounded
                    shadow-lg
                    z-50
                    "
                >



                    <div
                        className="
                        p-3
                        font-bold
                        border-b
                        "
                    >

                        Notifications

                    </div>





                    {notifications.length === 0 ? (

                        <p className="p-4 text-gray-500">

                            No notifications

                        </p>


                    ) : (


                        notifications.slice(0, 5)
                            .map(notification => (


                                <div

                                    key={notification.id}

                                    onClick={() =>
                                        markRead(notification)
                                    }

                                    className={`
                                p-3
                                cursor-pointer
                                border-b
                                ${notification.read
                                            ?
                                            "bg-white"
                                            :
                                            "bg-blue-50"
                                        }
                                `}

                                >


                                    <p className="font-semibold">

                                        {notification.title}

                                    </p>



                                    <p className="text-sm">

                                        {notification.message}

                                    </p>



                                </div>


                            ))


                    )}



                </div>

            )}



        </div>


    );

}