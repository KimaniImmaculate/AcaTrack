import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { UserProfile } from "../types/User";

export function useSupervisors() {
    const [supervisors, setSupervisors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSupervisors = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "supervisor")
                );

                const snap = await getDocs(q);

                const data: UserProfile[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<UserProfile, "id">),
                }));

                setSupervisors(data);
            } catch (err) {
                console.error("Failed to load supervisors:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSupervisors();
    }, []);

    return { supervisors, loading };
}