import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./contexts/AuthContext";

/**
 * MAIN APP ROUTER
 * This replaces ALL manual page switching
 */
export default function App() {
  const { user, loading } = useAuth();

  // wait for Firebase auth check
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}