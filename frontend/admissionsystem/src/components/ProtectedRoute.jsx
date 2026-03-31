import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();

  // Require both token and user
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}