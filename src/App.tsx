import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Role-protected wrapper component
import ProtectedRoute from "./components/ProtectedRoute";

// Role-based dashboards
import StudentDashboard from "./pages/student/StudentDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

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
        <Route path="/login" element={<Login />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

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

        {/* SUPERVISOR DASHBOARD */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorDashboard />
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

        {/* =========================
            DEFAULT ROUTE
            Redirect everything unknown
        ========================== */}

        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}