import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";
import NewProposal from "./pages/student/NewProposal";
import Proposals from "./pages/student/Proposals";
import ProposalDetail from "./pages/student/ProposalDetail";
// Role-protected wrapper component
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Role-based dashboards
import StudentDashboard from "./pages/student/StudentDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorProposals from "./pages/supervisor/SupervisorProposals";
import SupervisorProposalDetail from "./pages/supervisor/SupervisorProposalDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import AdminProposals from "./pages/admin/AdminProposals";
import AdminProposalDetail from "./pages/admin/AdminProposalDetail";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/Notifications";
import AIInsights from "./pages/admin/AIAnalytics";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import ScheduleMeeting from "./pages/student/ScheduleMeeting";


import MeetingRequests from "./pages/supervisor/MeetingRequests";
import AddMeetingLink from "./pages/student/AddMeetingLink";
import Meetings from "./pages/shared/Meetings";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminMeetingDetail from "./pages/admin/AdminMeetingDetail";

/**
 * MAIN APPLICATION ROUTER
 * ------------------------
 * This file controls ALL navigation in AcaTrack.
 *
 * We do NOT put business logic here.
 * Only route definitions + access control.
 */
export default function App() {
  return (
    <BrowserRouter>

      {/* ROUTE DEFINITIONS */}
      <Routes>

        {/* =========================
            PUBLIC ROUTES
            (No login required)
        ========================== */}

        {/* Login page */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* =========================
            ROLE-BASED ROUTES
            (Protected by authentication + role)
        ========================== */}

        {/* STUDENT DASHBOARD */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/new-proposal"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <NewProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/proposals"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Proposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/proposals/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ProposalDetail />
            </ProtectedRoute>
          }
        />
        <Route

          path="/student/proposals/:proposalId/schedule"

          element={<ScheduleMeeting />}

        />
        <Route
          path="/student/meetings"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Meetings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/meetings/:meetingId/add-link"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AddMeetingLink />
            </ProtectedRoute>
          }
        />


        {/* SUPERVISOR DASHBOARD */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/assigned"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/proposals/:id"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorProposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/meeting-requests"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <MeetingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/meetings"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <Meetings />
            </ProtectedRoute>
          }
        />


        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignSupervisor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/proposals"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/proposals/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AIInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "supervisor",
                "admin"
              ]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/meetings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMeetings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "supervisor",
                "admin"
              ]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/meetings/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMeetingDetail />
            </ProtectedRoute>
          }
        />

        {/* =========================
            DEFAULT ROUTE
            Redirect everything unknown
        ========================== */}

        <Route path="/" element={<Landing />} />

      </Routes>
    </BrowserRouter>
  );
}