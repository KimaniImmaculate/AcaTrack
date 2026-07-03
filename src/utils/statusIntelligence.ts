export const statusMessages: Record<string, string> = {
    draft: "Draft saved. Not submitted yet.",
    submitted: "Submitted. Awaiting supervisor review.",
    under_review: "Under review by supervisor.",
    revision_requested: "Supervisor requested revisions. Action required.",
    resubmitted: "Revision submitted. Awaiting review.",
    approved: "Approved.",
    rejected: "Rejected."
};

export const statusColors: Record<string, string> = {
    draft: "text-gray-600",
    submitted: "text-blue-600",
    under_review: "text-yellow-600",
    revision_requested: "text-red-600",
    resubmitted: "text-purple-600",
    approved: "text-green-600",
    rejected: "text-red-700"
};