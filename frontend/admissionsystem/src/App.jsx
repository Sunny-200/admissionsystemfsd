import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

import AdminPage from "./pages/Admin";
import AdminAssignments from "./pages/AdminAssignments";
import AdminApplicationDetail from "./pages/AdminApplicationDetail";
import ApplicationDetailWrapper from "./pages/admin/ApplicationDetailWrapper";
import AdminStatistics from "./pages/admin/AdminStatistics";
import VerifierDashboard from "./pages/VerifierDashboard";
import VerifierApplicationDetail from "./pages/VerifierApplicationDetail";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="STUDENT">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={
            <ProtectedRoute role="STUDENT">
              <Register />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/applications/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <ApplicationDetailWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminStatistics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/verifier"
          element={
            <ProtectedRoute role="VERIFIER">
              <VerifierDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/verifier/applications/:id"
          element={
            <ProtectedRoute role="VERIFIER">
              <VerifierApplicationDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
