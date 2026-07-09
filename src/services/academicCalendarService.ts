import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface AcademicCalendar {
    proposalStartDate: string;  // ISO date string  "YYYY-MM-DD"
    proposalDueDate:   string;
    reviewDueDate:     string;
    updatedAt?:        string;
    updatedBy?:        string;
}

const CALENDAR_DOC = doc(db, "settings", "academic_calendar");

export const saveAcademicCalendar = async (
    data: Omit<AcademicCalendar, "updatedAt">,
    uid: string
): Promise<void> => {
    await setDoc(CALENDAR_DOC, { ...data, updatedAt: new Date().toISOString(), updatedBy: uid });
};

export const subscribeToAcademicCalendar = (
    callback: (cal: AcademicCalendar | null) => void
) =>
    onSnapshot(CALENDAR_DOC, (snap) =>
        callback(snap.exists() ? (snap.data() as AcademicCalendar) : null)
    );
