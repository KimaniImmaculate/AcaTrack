export const sidebarConfig = {
    student: [
        { label: "Dashboard", path: "/student" },
        { label: "My Proposals", path: "/student/proposals" },
        { label: "My Meetings", path: "/student/meetings" },
        { label: "New Proposal", path: "/student/new-proposal" },
    ],

    supervisor: [
        { label: "Dashboard", path: "/supervisor" },
        { label: "Assigned Proposals", path: "/supervisor/assigned" },
        { label: "Meetings", path: "/supervisor/meetings" },
    ],

    admin: [
        { label: "Dashboard", path: "/admin" },
        { label: "All Proposals", path: "/admin/proposals" },
        { label: "Users", path: "/admin/users" },
        { label: "Reports", path: "/admin/reports" },
        { label: "AI Insights", path: "/admin/ai-analytics" }
    ],
};