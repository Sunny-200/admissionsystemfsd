import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminApplicationsTable from "../components/admin/AdminApplicationsTable";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">

        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage student applications</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("/admin/assignments")}>
            Assignments
          </button>

          <button onClick={() => {
            logout();
            navigate("/login");
          }}>
            Logout
          </button>
        </div>

      </div>

      <AdminApplicationsTable />
    </div>
  );
}