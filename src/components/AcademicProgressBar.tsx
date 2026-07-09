import { AcademicCalendar } from "../services/academicCalendarService";

interface Props {
    calendar: AcademicCalendar | null;
    /** "admin" shows an extra "Not configured" hint when no dates are set */
    role?: "student" | "supervisor" | "admin";
}

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function daysRemaining(targetISO: string) {
    const diff = new Date(targetISO).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AcademicProgressBar({ calendar, role = "student" }: Props) {
    if (!calendar) {
        return (
            <div className="bg-white border border-dashed border-amber-200 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-700">Academic Calendar Not Set</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {role === "admin"
                            ? "Configure the proposal period dates below."
                            : "The admin has not configured the proposal period dates yet."}
                    </p>
                </div>
            </div>
        );
    }

    const now   = Date.now();
    const start = new Date(calendar.proposalStartDate).getTime();
    const due   = new Date(calendar.proposalDueDate).getTime();
    const rev   = new Date(calendar.reviewDueDate).getTime();
    const total = rev - start;

    const clampedElapsed = Math.max(0, Math.min(now - start, total));
    const progressPct    = total > 0 ? (clampedElapsed / total) * 100 : 0;

    type Phase = "not_started" | "submission" | "review" | "complete";
    let phase: Phase;
    if (now < start)    phase = "not_started";
    else if (now < due) phase = "submission";
    else if (now < rev) phase = "review";
    else                phase = "complete";

    const submissionPct = total > 0 ? ((due - start) / total) * 100 : 50;

    const phaseConfig: Record<Phase, { label: string; colour: string; desc: string }> = {
        not_started: { label: "Not Started", colour: "text-slate-500",  desc: `Starts ${fmt(calendar.proposalStartDate)}` },
        submission:  { label: "Submission Open",  colour: "text-amber-600",  desc: `${daysRemaining(calendar.proposalDueDate)} days until deadline` },
        review:      { label: "Under Review",     colour: "text-yellow-600", desc: `${daysRemaining(calendar.reviewDueDate)} days until review ends` },
        complete:    { label: "Period Closed",    colour: "text-emerald-600", desc: "All phases completed" },
    };

    const cfg = phaseConfig[phase];

    const stages = [
        { key: "submission", label: "Submission",  date: calendar.proposalStartDate },
        { key: "review",     label: "Review",       date: calendar.proposalDueDate   },
        { key: "complete",   label: "Complete",     date: calendar.reviewDueDate     },
    ] as const;

    const stageState = (key: typeof stages[number]["key"]) => {
        if (phase === "not_started") return "upcoming";
        if (key === "submission") {
            if (phase === "submission") return "active";
            return "done";
        }
        if (key === "review") {
            if (phase === "review") return "active";
            if (phase === "complete") return "done";
            return "upcoming";
        }
        if (key === "complete") {
            return phase === "complete" ? "done" : "upcoming";
        }
        return "upcoming";
    };

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Academic Calendar</h3>
                        <p className={`text-xs font-semibold mt-0.5 ${cfg.colour}`}>{cfg.label}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 font-medium">{cfg.desc}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                        {Math.round(progressPct)}% complete
                    </p>
                </div>
            </div>

            {/* Progress track */}
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                {/* Submission / Review divider marker */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
                    style={{ left: `${submissionPct}%` }}
                />
                {/* Animated fill */}
                <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-amber-500 to-yellow-400"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Date ticks */}
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1 mb-3">
                <span>{fmt(calendar.proposalStartDate)}</span>
                {/* Submission deadline marker positioned at submissionPct */}
                <span className="text-center">{fmt(calendar.proposalDueDate)}</span>
                <span className="text-right">{fmt(calendar.reviewDueDate)}</span>
            </div>

            {/* Stage pills */}
            <div className="grid grid-cols-3 gap-2">
                {stages.map((s) => {
                    const state = stageState(s.key);
                    return (
                        <div
                            key={s.key}
                            className={`rounded-xl py-2 px-3 text-center transition-all ${
                                state === "active"
                                    ? "bg-amber-100 border border-amber-200 shadow-sm"
                                    : state === "done"
                                    ? "bg-emerald-50 border border-emerald-100"
                                    : "bg-slate-50 border border-slate-100"
                            }`}
                        >
                            <div className={`flex items-center justify-center gap-1 mb-0.5 ${
                                state === "active" ? "text-amber-600" :
                                state === "done"   ? "text-emerald-600" :
                                "text-slate-400"
                            }`}>
                                {state === "done" ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : state === "active" ? (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-wider`}>{s.label}</span>
                            </div>
                            <p className={`text-[9px] font-medium ${
                                state === "active" ? "text-amber-500" :
                                state === "done"   ? "text-emerald-500" :
                                "text-slate-300"
                            }`}>
                                {state === "done" ? "Completed" : state === "active" ? "In Progress" : fmt(s.date)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
