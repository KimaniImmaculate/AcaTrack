import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import ActivityTimeline from "../../components/ActivityTimeline";

const STATUS_BADGE: Record<string, { label: string; color: string; dot: string }> = {
    pending:               { label: "Pending",       color: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
    approved_waiting_link: { label: "Awaiting Link", color: "bg-blue-100 text-blue-700",       dot: "bg-blue-400" },
    scheduled:             { label: "Upcoming",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
    completed:             { label: "Completed",     color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400" },
    cancelled:             { label: "Cancelled",     color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    declined:              { label: "Declined",      color: "bg-rose-100 text-rose-700",       dot: "bg-rose-400" },
    rescheduled:           { label: "Rescheduled",   color: "bg-purple-100 text-purple-700",   dot: "bg-purple-400" },
};

function formatTs(ts: any) {
    if (!ts) return "—";
    return new Date(ts.seconds * 1000).toLocaleString();
}

export default function AdminMeetingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [supervisor, setSupervisor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMeeting() {
            if (!id) return;
            const meetingSnap = await getDoc(doc(db, "meetingRequests", id));
            if (!meetingSnap.exists()) { setLoading(false); return; }
            const data = { id: meetingSnap.id, ...(meetingSnap.data() as any) };
            setMeeting(data);

            const [studentSnap, supervisorSnap] = await Promise.all([
                getDoc(doc(db, "users", data.studentId)),
                getDoc(doc(db, "users", data.supervisorId)),
            ]);
            if (studentSnap.exists()) setStudent(studentSnap.data());
            if (supervisorSnap.exists()) setSupervisor(supervisorSnap.data());
            setLoading(false);
        }
        loadMeeting();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-3 text-slate-400">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span className="font-semibold text-sm">Loading meeting…</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!meeting) {
        return (
            <DashboardLayout>
                <div className="max-w-xl mx-auto text-center py-24">
                    <p className="text-slate-400 font-semibold">Meeting not found.</p>
                </div>
            </DashboardLayout>
        );
    }

    const badge = STATUS_BADGE[meeting.status] ?? { label: meeting.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Back + Header */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mb-4 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Back to Meetings
                    </button>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{meeting.title}</h1>
                            {meeting.agenda && (
                                <p className="text-sm text-slate-400 mt-1">{meeting.agenda}</p>
                            )}
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Meeting Details */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="font-bold text-slate-800">Meeting Details</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoItem label="Date" value={meeting.requestedDate} />
                                <InfoItem label="Time" value={meeting.requestedTime} />
                                <InfoItem label="Duration" value={meeting.duration} />
                                <InfoItem label="Mode" value={meeting.mode} className="capitalize" />
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="grid sm:grid-cols-2 gap-5">
                            <ParticipantCard
                                role="Student"
                                name={`${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim()}
                                email={student?.email}
                                dept={student?.department}
                                color="amber"
                            />
                            <ParticipantCard
                                role="Supervisor"
                                name={`${supervisor?.prefix ? supervisor.prefix + " " : ""}${supervisor?.firstName ?? ""} ${supervisor?.lastName ?? ""}`.trim()}
                                email={supervisor?.email}
                                dept={supervisor?.department}
                                color="emerald"
                            />
                        </div>

                        {/* Meeting Link */}
                        {meeting.meetingLink && (
                            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                                <h2 className="font-bold text-slate-800 mb-4">Meeting Link</h2>
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                    </svg>
                                    <a
                                        href={meeting.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-amber-600 hover:text-amber-700 font-semibold truncate"
                                    >
                                        {meeting.meetingLink}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Proposed Reschedule */}
                        {meeting.status === "rescheduled" && (
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 space-y-2">
                                <h2 className="font-bold text-purple-700 mb-1">Proposed Reschedule Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-purple-900">
                                    <InfoItem label="Proposed Date" value={meeting.rescheduleDate} />
                                    <InfoItem label="Proposed Time" value={meeting.rescheduleTime} />
                                </div>
                                {meeting.rescheduleReason && (
                                    <div className="mt-3">
                                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Supervisor's Notes</p>
                                        <p className="text-sm text-purple-700 italic">"{meeting.rescheduleReason}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Completion Remarks */}
                        {meeting.status === "completed" && meeting.remarks && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-2">
                                <h2 className="font-bold text-emerald-700 mb-1">Supervisor's Remarks</h2>
                                <p className="text-sm text-emerald-800 font-medium">"{meeting.remarks}"</p>
                            </div>
                        )}

                        {/* Cancellation / Decline */}
                        {(meeting.status === "cancelled" || meeting.status === "declined") && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                                <h2 className="font-bold text-rose-700 mb-3">Cancellation / Decline Details</h2>
                                <p className="text-sm text-rose-600">{meeting.cancelReason || meeting.declineReason || "No reason provided."}</p>
                            </div>
                        )}

                        {/* Activity Timeline */}
                        <ActivityTimeline proposalId={meeting.proposalId} />
                    </div>

                    {/* Right Column – Audit */}
                    <div className="space-y-5">
                        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="font-bold text-slate-800">Audit Info</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <AuditRow label="Created On"    value={formatTs(meeting.createdAt)} />
                                <AuditRow label="Last Updated"  value={formatTs(meeting.updatedAt)} />
                                <AuditRow label="Completed On"  value={formatTs(meeting.completedAt)} />
                                <AuditRow label="Completed By"  value={meeting.completedBy || "—"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoItem({ label, value, className = "" }: { label: string; value: any; className?: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-slate-700 ${className}`}>{value || "—"}</p>
        </div>
    );
}

function AuditRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-xs text-slate-600 font-medium text-right">{value}</span>
        </div>
    );
}

function ParticipantCard({ role, name, email, dept, color }: {
    role: string; name: string; email?: string; dept?: string; color: "amber" | "emerald";
}) {
    const colors = {
        amber:   { bg: "bg-amber-50",   border: "border-amber-100",   icon: "text-amber-500",   label: "text-amber-600" },
        emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-500", label: "text-emerald-600" },
    }[color];

    return (
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5 space-y-3`}>
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <p className={`text-[10px] font-bold ${colors.label} uppercase tracking-widest`}>{role}</p>
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">{name || "—"}</p>
                {email && <p className="text-xs text-slate-500 mt-0.5">{email}</p>}
                {dept && <p className="text-xs text-slate-400 mt-0.5">{dept}</p>}
            </div>
        </div>
    );
}