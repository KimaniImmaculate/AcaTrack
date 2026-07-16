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
    proposalTitle?: string;
}

export default function ActivityTimeline({
    proposalId,
    proposalTitle,
}: Props) {

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

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

    const handleDownload = () => {
        setDownloading(true);

        const title = proposalTitle || `Proposal ${proposalId}`;
        const exportDate = new Date().toLocaleDateString("en-US", {
            day: "numeric", month: "long", year: "numeric"
        });

        const rows = activities.map((a) => {
            const actorLine = a.actor
                ? `<div class="actor">${a.actor.name} <span class="role">(${a.actor.role})</span></div>`
                : "";
            return `
                <div class="entry">
                    <div class="dot"></div>
                    <div class="body">
                        ${actorLine}
                        <div class="message">${a.message}</div>
                        <div class="date">${formatActivityDate(a.createdAt)}</div>
                    </div>
                </div>`;
        }).join("");

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Activity Timeline — ${title}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 48px; }
        .header { border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 32px; }
        .header h1 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .header .sub { font-size: 13px; color: #94a3b8; margin-top: 6px; }
        .badge { display: inline-block; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 10px; margin-top: 8px; }
        .timeline { position: relative; padding-left: 28px; border-left: 2px solid #e2e8f0; }
        .entry { position: relative; margin-bottom: 24px; }
        .dot { position: absolute; left: -35px; top: 4px; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 2px #f59e0b; }
        .body { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .actor { font-weight: 700; color: #1e293b; font-size: 13px; margin-bottom: 4px; }
        .role { font-weight: 400; color: #94a3b8; font-size: 11px; text-transform: capitalize; }
        .message { font-size: 13px; color: #475569; line-height: 1.6; }
        .date { font-size: 11px; color: #94a3b8; margin-top: 8px; }
        .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #cbd5e1; text-align: right; }
        @media print { body { background: #fff; padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="badge">Activity Timeline</div>
        <h1>${title}</h1>
        <div class="sub">Exported on ${exportDate} &nbsp;·&nbsp; ${activities.length} event${activities.length !== 1 ? "s" : ""}</div>
    </div>
    <div class="timeline">
        ${activities.length === 0
            ? '<div class="empty">No activity recorded for this proposal yet.</div>'
            : rows}
    </div>
    <div class="footer">Generated by AcaTrack &nbsp;·&nbsp; ${exportDate}</div>
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity-timeline-${proposalId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloading(false);
    };

    return (
        <div className="mt-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">
                        Activity Timeline
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Full audit trail of all actions on this proposal
                    </p>
                </div>
                {!loading && activities.length > 0 && (
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 text-slate-500 font-bold text-xs transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                        title="Download timeline as HTML (open in browser to print/save as PDF)"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                        </svg>
                        {downloading ? "Exporting…" : "Export"}
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium py-6">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading activity…
                </div>
            )}

            {/* Empty */}
            {!loading && activities.length === 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-400 text-sm font-semibold">No activity yet.</p>
                    <p className="text-slate-300 text-xs mt-1">Events will appear here as the proposal progresses.</p>
                </div>
            )}

            {/* Timeline entries */}
            {!loading && activities.length > 0 && (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative">
                            {/* Dot */}
                            <span className="absolute -left-[25px] top-3 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow ring-2 ring-amber-500/20" />

                            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                                {activity.actor ? (
                                    <>
                                        <p className="font-bold text-slate-800 text-sm leading-snug">
                                            {activity.actor.name}{" "}
                                            <span className="font-normal text-[11px] text-slate-400 capitalize">
                                                ({activity.actor.role})
                                            </span>
                                        </p>
                                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                            {activity.message}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-semibold text-slate-700 text-sm leading-relaxed">
                                        {activity.message}
                                    </p>
                                )}
                                <p className="text-[11px] text-slate-400 font-medium mt-2">
                                    {formatActivityDate(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}