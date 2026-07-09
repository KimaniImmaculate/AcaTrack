import { useState, useEffect } from "react";
import {
    subscribeToAcademicCalendar,
    AcademicCalendar,
} from "../services/academicCalendarService";

export function useAcademicCalendar() {
    const [calendar, setCalendar] = useState<AcademicCalendar | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToAcademicCalendar((cal) => {
            setCalendar(cal);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { calendar, loading };
}
