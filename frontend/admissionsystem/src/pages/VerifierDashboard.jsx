import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
        const res = await API.get("/verifier/assignments");
        setApplications(res.data.applications || []);
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
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="card-base p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Assigned Applications</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <p className="text-gray-500">No applications assigned to you yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{app.studentId}</td>
                    <td className="px-6 py-3">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="px-6 py-3">{app.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          app.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/verifier/applications/${app.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
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
  );
}