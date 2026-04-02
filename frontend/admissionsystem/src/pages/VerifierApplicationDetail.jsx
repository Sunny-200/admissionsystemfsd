import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

const ALLOWED_STATUSES = ["VERIFIED", "REJECTED"];

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
        setStatus(ALLOWED_STATUSES.includes(currentStatus) ? currentStatus : "VERIFIED");
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
    if (!ALLOWED_STATUSES.includes(status)) {
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
      <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-sm text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => navigate("/verifier")}
              className="mt-4 border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm"
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
      <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-sm text-gray-600">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-blue-900 text-white rounded-lg px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold">Application Details</h1>
            <p className="text-xs opacity-90">Review and verify submitted application</p>
          </div>
          <button
            onClick={() => navigate("/verifier")}
            className="bg-white/20 text-white px-4 py-1 rounded-full text-xs font-semibold hover:bg-white/30 transition"
          >
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Applicant Overview
            </p>
          </div>
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-blue-900">{application.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Application ID: {application.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Application ID</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Email</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.user?.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Phone</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.contactNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Date of Birth</p>
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
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Academic Information
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Branch Allotted</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.branchAllotted}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Seat Allotment Source</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.seatAllotmentSource}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Guardian Details
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Name</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.guardianName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Phone</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.guardianNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Email</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.guardianEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Address
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">State</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.state}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-gray-500 tracking-wide">Address</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{application.permanentAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Documents
            </p>
          </div>
          <div className="px-6 py-5 space-y-3">
            {(application.documents || []).map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-sm transition"
              >
                <span className="text-sm font-medium text-gray-800">{doc.documentType}</span>
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

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Verification Form
            </p>
          </div>
          <form onSubmit={handleSubmitVerification} className="px-6 py-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                placeholder="Add verification comments..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-900 text-white hover:bg-blue-800 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}