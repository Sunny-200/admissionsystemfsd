import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function ApplicationDetail({ applicationId }) {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await API.get(`/admin/applications/${applicationId}`);
        setApplication(res.data.data.application);
      } catch (err) {
        console.error(err);
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  function handleViewDocument(doc) {
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const bucket = "student-documents";

    // const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileUrl}`;
    // window.open(fullUrl, "_blank");
    const url = doc?.viewUrl || doc?.fileUrl;
    if (url) {
      window.open(url, "_blank");
    }
  }

  if (loading) return <p className="text-sm text-app-muted">Loading...</p>;

  if (error || !application) {
    return (
      <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
        <p className="text-red-600 text-sm mb-4">{error || "Application not found"}</p>
        <button
          onClick={() => navigate("/admin")}
          className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin")}
        className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
      >
        ← Back
      </button>

      <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
        <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
          <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
            Application Overview
          </p>
        </div>
        <h1 className="text-xl font-semibold text-app-primary">{application.name}</h1>
        <p className="text-sm text-app-muted mt-1">Status: {application.applicationStatus}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Personal Info</p>
          </div>
          <p className="text-sm text-gray-700">Email: {application.user.email}</p>
          <p className="text-sm text-gray-700">DOB: {new Date(application.dateOfBirth).toDateString()}</p>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Documents</p>
          </div>
          <div className="space-y-3">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{doc.documentType}</span>
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2 text-sm"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {application.remarksFromStudent && (
        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Remarks</p>
          </div>
          <p className="text-sm text-gray-700">{application.remarksFromStudent}</p>
        </div>
      )}
    </div>
  );
}