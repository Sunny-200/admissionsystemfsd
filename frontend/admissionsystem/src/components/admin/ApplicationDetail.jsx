import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function ApplicationDetail({ applicationId }) {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  async function fetchApplication() {
    try {
      const res = await API.get(`/admin/applications/${applicationId}`);
      setApplication(res.data.application);
    } catch (err) {
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  }

  function handleViewDocument(fileUrl) {
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const bucket = "student-documents";

    // const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileUrl}`;
    // window.open(fullUrl, "_blank");
    window.open(fileUrl, "_blank");
  }

  if (loading) return <p>Loading...</p>;

  if (error || !application) {
    return (
      <div>
        <p>{error || "Application not found"}</p>
        <button onClick={() => navigate("/admin")}>Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <button onClick={() => navigate("/admin")}>
        ← Back
      </button>

      <h1 className="text-xl font-bold">{application.name}</h1>
      <p>Status: {application.applicationStatus}</p>

      {/* PERSONAL */}
      <div>
        <h3>Personal Info</h3>
        <p>Email: {application.user.email}</p>
        <p>DOB: {new Date(application.dateOfBirth).toDateString()}</p>
      </div>

      {/* DOCUMENTS */}
      <div>
        <h3>Documents</h3>
        {application.documents.map((doc) => (
          <div key={doc.id}>
            {doc.documentType}
            <button onClick={() => handleViewDocument(doc.fileUrl)}>
              View
            </button>
          </div>
        ))}
      </div>

      {/* REMARKS */}
      {application.remarksFromStudent && (
        <div>
          <h3>Remarks</h3>
          <p>{application.remarksFromStudent}</p>
        </div>
      )}
    </div>
  );
}