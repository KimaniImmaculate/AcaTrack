import { Proposal } from "../types/Proposal";

type Props = {
    status: Proposal["status"];
};

export default function StatusBadge({ status }: Props) {
    const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300";

    const styles: Record<string, string> = {
        draft:              "bg-slate-100 text-slate-600 border-slate-200/80",
        submitted:          "bg-amber-100 text-amber-700 border-amber-200",
        under_review:       "bg-yellow-50 text-yellow-700 border-yellow-200",
        revision_requested: "bg-rose-50 text-rose-700 border-rose-100",
        resubmitted:        "bg-amber-50 text-amber-600 border-amber-100",
        approved:           "bg-emerald-50 text-emerald-700 border-emerald-100",
        rejected:           "bg-slate-200 text-slate-700 border-slate-300",
    };

    const labelMap: Record<string, string> = {
        draft: "Draft",
        submitted: "Submitted",
        under_review: "Under Review",
        revision_requested: "Revision Requested",
        resubmitted: "Resubmitted",
        approved: "Approved",
        rejected: "Rejected",
    };

    return (
        <span className={`${base} ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {labelMap[status] || status.replace("_", " ")}
        </span>
    );
}