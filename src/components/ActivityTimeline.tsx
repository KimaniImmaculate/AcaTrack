import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { ActivityActor } from "../services/activityService";

interface Activity {
    id: string;
    proposalId: string;
    message: string;
    actor?: ActivityActor;
    createdAt: any;
}

interface Props {
    proposalId: string;
}

export default function ActivityTimeline({
    proposalId,
}: Props) {

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const formatActivityDate = (createdAt: any) => {
        if (!createdAt || !createdAt.toDate) return "Just now";
        const date = createdAt.toDate();
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "long" });
        const year = date.getFullYear();
        const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        return `${day} ${month} ${year} • ${time}`;
    };

    useEffect(() => {

        const q = query(
            collection(db, "activities"),
            where("proposalId", "==", proposalId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {

                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Activity, "id">)
                }));

                setActivities(data);
                setLoading(false);
            },
            (error) => {
                console.error("Activity timeline error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [proposalId]);

    return (

        <div className="mt-10">

            <h2 className="text-xl font-bold mb-4">
                Activity Timeline
            </h2>

            {loading && (
                <p className="text-gray-500">
                    Loading activity...
                </p>
            )}

            {!loading && activities.length === 0 && (
                <p className="text-gray-500">
                    No activity yet.
                </p>
            )}

            <div className="space-y-4">

                {activities.map((activity) => (

                    <div
                        key={activity.id}
                        className="border-l-4 border-blue-600 pl-4 py-3 bg-gray-50 rounded shadow-sm"
                    >
                        {activity.actor ? (
                            <>
                                <p className="font-bold text-gray-900">
                                    {activity.actor.name}{" "}
                                    <span className="font-normal text-xs text-gray-500 capitalize">
                                        ({activity.actor.role})
                                    </span>
                                </p>
                                <p className="text-gray-700 mt-0.5">
                                    {activity.message}
                                </p>
                            </>
                        ) : (
                            <p className="font-medium text-gray-700">
                                {activity.message}
                            </p>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            {formatActivityDate(activity.createdAt)}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}