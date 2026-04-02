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

  const totalAssigned = applications.length;
  const inReviewCount = applications.filter(
    (app) => app.applicationStatus === "IN_REVIEW"
  ).length;
  const verifiedCount = applications.filter(
    (app) => app.applicationStatus === "VERIFIED"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">
              My Assigned Applications
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and verify applications assigned to you
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-outline hover:bg-red-600 hover:text-white hover:border-red-600"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Assigned</p>
            <p className="text-3xl font-bold mt-2 text-blue-900">{totalAssigned}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">In Review</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{inReviewCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {applications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
                No applications assigned yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-blue-50 text-blue-900 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="p-4 text-left font-medium">Application ID</th>
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Email</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="p-4 text-sm text-gray-700">{app.id}</td>
                      <td className="p-4 text-sm text-gray-700">{app.name}</td>
                      <td className="p-4 text-sm text-gray-700">{app.email}</td>
                      <td className="p-4 text-sm text-gray-700">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.applicationStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.applicationStatus === "IN_REVIEW"
                              ? "bg-blue-100 text-blue-800"
                              : app.applicationStatus === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <Link
                          to={`/verifier/applications/${app.id}`}
                          className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-sm"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}