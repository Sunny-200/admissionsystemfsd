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
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage student applications
            </p>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={() => navigate("/admin/intake")}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              Manage Intake
            </button>

            <button
              onClick={() => navigate("/admin/assignments")}
              className="bg-blue-900 text-white hover:bg-blue-800 rounded-md px-4 py-2 text-sm font-medium transition"
            >
              Assignments
            </button>

            <button
              onClick={() => navigate("/admin/statistics")}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              Statistics
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-outline hover:bg-red-600 hover:text-white hover:border-red-600"
              >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <AdminApplicationsTable />
        </div>
      </div>
    </div>
  );
}