import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useDepartments() {
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const snap = await getDocs(collection(db, "users"));

                const unique = Array.from(
                    new Set(
                        snap.docs
                            .map((doc) => doc.data().department as string)
                            .filter(Boolean)
                    )
                ).sort();

                setDepartments(unique);
            } catch (err) {
                console.error("Failed to load departments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return { departments, loading };
}
