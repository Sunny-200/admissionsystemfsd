import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      fetchProfile();
      fetchRemarks();
    }
  }, [user]);

  // 📄 Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await API.get("/student/profile");

      setProfile(res.data.profile);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No application found. Please complete registration.");
      } else {
        setError("Failed to load dashboard");
      }
      setLoading(false);
    }
  };

  // 💬 Fetch remarks
  const fetchRemarks = async () => {
    try {
      const res = await API.get("/student/remarks");
      setRemarks(res.data.remarks);
    } catch (err) {
      console.error("Remarks error:", err);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 📥 Download (for now direct link)
  const handleDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  if (loading) {
    return <div className="text-center mt-10">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p>{error}</p>
        <button onClick={() => navigate("/register")}>
          Go to Registration
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1>Welcome, {profile.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>Status: {profile.applicationStatus}</h2>

      {/* Documents */}
      <h3>Documents</h3>
      {profile.documents.map((doc) => (
        <div key={doc.id}>
          <span>{doc.documentType}</span>
          <button onClick={() => handleDownload(doc.fileUrl)}>
            Download
          </button>
        </div>
      ))}

      {/* Remarks */}
      <h3>Verifier Remarks</h3>
      {remarks.map((r) => (
        <div key={r.id}>
          <p>{r.text}</p>
          <small>
            {r.author.name} - {new Date(r.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}