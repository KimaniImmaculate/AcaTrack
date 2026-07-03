import { Proposal } from "../types/Proposal";

type Props = {
    status: Proposal["status"];
};

export default function StatusBadge({ status }: Props) {
    const base = "px-2 py-1 text-xs rounded font-medium";

    const styles: Record<string, string> = {
        draft: "bg-gray-200 text-gray-700",
        submitted: "bg-blue-100 text-blue-700",
        under_review: "bg-yellow-100 text-yellow-700",
        revision_requested: "bg-red-100 text-red-700",
        resubmitted: "bg-purple-100 text-purple-700",
        approved: "bg-green-100 text-green-700",
        rejected: "bg-gray-300 text-gray-800",
    };

    return (
        <span className={`${base} ${styles[status] || "bg-gray-100"}`}>
            {status.replace("_", " ")}
        </span>
    );
}