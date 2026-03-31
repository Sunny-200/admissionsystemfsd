import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const latestVerifierRemark = remarks.find((r) => r.author?.role === "VERIFIER");

  // 🔐 Redirect based on role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "ADMIN") {
      navigate("/admin");
    } else if (user.role === "VERIFIER") {
      navigate("/verifier");
    } else {
      const loadDashboard = async () => {
        try {
          const profileRes = await API.get("/student/application");
          setProfile(profileRes.data.data.application);
        } catch (err) {
          if (err.response?.status === 404) {
            setError("No application found. Please complete registration.");
          } else {
            setError("Failed to load dashboard");
          }
        } finally {
          setLoading(false);
        }

        try {
          const remarksRes = await API.get("/student/remarks");
          setRemarks(remarksRes.data.data.remarks);
        } catch (err) {
          console.error("Remarks error:", err);
        }
      };

      loadDashboard();
    }
  }, [user, navigate]);

  // 🚪 Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 📥 Download (for now direct link)
  const handleDownload = (doc) => {
    const url = doc?.viewUrl || doc?.fileUrl;
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <p className="text-sm text-app-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
            Student Dashboard
          </h1>
          <p className="text-sm text-app-muted mt-1 mb-6">
            Track your admission progress and updates
          </p>
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate("/register")}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
              Student Dashboard
            </h1>
            <p className="text-sm text-app-muted mt-1 mb-6">
              Track your admission progress and updates
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="bg-[#1e3a8a] text-white rounded-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm opacity-90">Application Status</p>
            <p className="text-lg font-semibold">{profile.applicationStatus}</p>
          </div>
          <p className="text-sm mt-2 md:mt-0 text-white">Welcome, {profile.name}</p>
        </div>

        {(profile.applicationStatus === "REJECTED" || profile.applicationStatus === "DOCUMENTS_REJECTED") && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-red-700">Your application was rejected</p>
            <p className="text-sm text-red-600 mt-1">
              {latestVerifierRemark?.text || "No verifier remarks available yet."}
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-4 bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              Resubmit Application
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Basic Info</p>
            </div>
            <p className="text-sm text-gray-700">Name: {profile.name}</p>
            <p className="text-sm text-gray-700">DOB: {new Date(profile.dateOfBirth).toDateString()}</p>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Academic Info</p>
            </div>
            <p className="text-sm text-gray-700">Branch: {profile.branchAllotted}</p>
            <p className="text-sm text-gray-700">Seat Source: {profile.seatAllotmentSource}</p>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Contact Info</p>
            </div>
            <p className="text-sm text-gray-700">Phone: {profile.contactNumber}</p>
            <p className="text-sm text-gray-700">Guardian: {profile.guardianName}</p>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Documents</p>
            </div>
            <div className="space-y-3">
              {profile.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{doc.documentType}</span>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2 text-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Remarks</p>
            </div>
            <div className="space-y-3">
              {remarks.length === 0 && (
                <p className="text-sm text-app-muted">No remarks yet.</p>
              )}
              {remarks.map((r) => (
                <div key={r.id} className="text-sm text-gray-700">
                  <p>{r.text}</p>
                  <p className="text-xs text-app-muted mt-1">
                    {r.author.name} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}