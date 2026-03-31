import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

export default function VerifierApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("VERIFIED");
  const [submitting, setSubmitting] = useState(false);
  const allowedStatuses = ["VERIFIED", "REJECTED"];

  // 🔐 auth protect
  useEffect(() => {
    if (!user || user.role !== "VERIFIER") {
      navigate("/login");
    }
  }, [user, navigate]);

  // 📦 fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await API.get(`/verifier/applications/${id}`);
        const app = res.data.data.application;
        setApplication(app);
        const currentStatus = app?.applicationStatus || "VERIFIED";
        setStatus(allowedStatuses.includes(currentStatus) ? currentStatus : "VERIFIED");
      } catch (err) {
        console.error(err);
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!allowedStatuses.includes(status)) {
      setError("Please select a valid verification status");
      return;
    }
    setSubmitting(true);

    try {
      await API.post(`/verifier/review`, {
        applicationId: id,
        status,
        comments,
      });
      alert("Verification submitted successfully!");
      navigate("/verifier");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDocument = (doc) => {
    const url = doc?.viewUrl || doc?.fileUrl;
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <p className="text-sm text-app-muted">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => navigate("/verifier")}
              className="mt-4 border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <p className="text-sm text-app-muted">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
              Application Details
            </h1>
            <p className="text-sm text-app-muted mt-1">
              Review and verify submitted application
            </p>
          </div>
          <button
            onClick={() => navigate("/verifier")}
            className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
          >
            Back
          </button>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Applicant Overview
            </p>
          </div>
          <h2 className="text-xl font-semibold text-app-primary">
            {application.name}
          </h2>
          <p className="text-sm text-app-muted mt-1">
            Application ID: {application.id}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="font-semibold text-gray-700">Application ID:</label>
            <p>{application.id}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Email:</label>
            <p>{application.user?.email}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Phone:</label>
            <p>{application.contactNumber}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Date of Birth:</label>
            <p>{new Date(application.dateOfBirth).toDateString()}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Aadhar:</label>
            <p>{application.aadharNumber}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">
              Application Status:
            </label>
            <p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  application.applicationStatus === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : application.applicationStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {application.applicationStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4"></div>
        </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Academic Information
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Branch Allotted</label>
              <p className="text-sm text-gray-700">{application.branchAllotted}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Seat Allotment Source</label>
              <p className="text-sm text-gray-700">{application.seatAllotmentSource}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Guardian Details
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-700">{application.guardianName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-700">{application.guardianNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-700">{application.guardianEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Address
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <p className="text-sm text-gray-700">{application.state}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-sm text-gray-700">{application.permanentAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Documents
            </p>
          </div>
          <div className="space-y-3">
            {(application.documents || []).map((doc) => (
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

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Verification Form
            </p>
          </div>
          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
              >
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full h-32"
                placeholder="Add verification comments..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}