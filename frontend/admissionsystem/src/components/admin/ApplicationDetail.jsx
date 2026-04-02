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

  if (loading) return <p className="text-sm text-gray-600">Loading...</p>;

  if (error || !application) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <p className="text-red-600 text-sm mb-4">{error || "Application not found"}</p>
        <button
          onClick={() => navigate("/admin")}
          className="border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-900 text-white rounded-xl px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Application Details</h1>
          <p className="text-sm text-blue-100">Review and verify submitted application</p>
        </div>
        <button
          onClick={() => navigate("/admin")}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-md text-sm transition"
        >
          Back
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 text-sm font-semibold text-blue-900 uppercase tracking-wide bg-gray-50">
          Applicant Overview
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Name</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{application.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Application ID</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{application.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Email</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{application.user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Phone</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{application.contactNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">DOB</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {new Date(application.dateOfBirth).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Aadhar</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{application.aadharNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wide">Application Status</p>
              <span
                className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  application.applicationStatus === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : application.applicationStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : application.applicationStatus === "IN_REVIEW"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {application.applicationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 text-sm font-semibold text-blue-900 uppercase tracking-wide bg-gray-50">
          Documents
        </div>
        <div className="px-6 py-5">
          <div className="space-y-3">
            {application.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-3 hover:bg-gray-100 transition"
              >
                <span className="text-sm font-medium text-gray-700">{doc.documentType}</span>
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="bg-blue-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-800 transition"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {application.remarksFromStudent && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 text-sm font-semibold text-blue-900 uppercase tracking-wide bg-gray-50">
            Remarks
          </div>
          <div className="px-6 py-5">
            <div className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">{application.remarksFromStudent}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}