import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

export default function VerifierDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 auth protect
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "VERIFIER") {
      if (user.role === "ADMIN") navigate("/admin");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  // 📦 fetch assignments
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await API.get("/verifier/assigned");
        setApplications(res.data.data.applications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "VERIFIER") {
      fetchApps();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <p className="text-sm text-app-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
              Verifier Dashboard
            </h1>
            <p className="text-sm text-app-muted mt-1 mb-6">
              Review and verify assigned applications
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Assigned Applications
            </p>
          </div>

          {applications.length === 0 ? (
            <p className="text-sm text-app-muted">No applications assigned yet.</p>
          ) : (
            <div className="bg-app-card border border-app-border rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-4 text-sm border-b border-app-border">Application ID</th>
                    <th className="p-4 text-sm border-b border-app-border">Name</th>
                    <th className="p-4 text-sm border-b border-app-border">Email</th>
                    <th className="p-4 text-sm border-b border-app-border">Status</th>
                    <th className="p-4 text-sm border-b border-app-border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm border-b border-app-border">{app.id}</td>
                      <td className="p-4 text-sm border-b border-app-border">{app.name}</td>
                      <td className="p-4 text-sm border-b border-app-border">{app.email}</td>
                      <td className="p-4 text-sm border-b border-app-border">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.applicationStatus === "VERIFIED"
                              ? "bg-green-100 text-green-700"
                              : app.applicationStatus === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-sm border-b border-app-border">
                        <Link
                          to={`/verifier/applications/${app.id}`}
                          className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2 text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}