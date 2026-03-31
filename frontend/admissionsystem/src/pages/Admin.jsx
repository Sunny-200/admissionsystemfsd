import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

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
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
              Admin Dashboard
            </h1>
            <p className="text-sm text-app-muted mt-1 mb-6">
              Manage student applications and assignments
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/assignments")}
              className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
            >
              Assignments
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Applications
            </p>
          </div>
          <AdminApplicationsTable />
        </div>
      </div>
    </div>
  );
}