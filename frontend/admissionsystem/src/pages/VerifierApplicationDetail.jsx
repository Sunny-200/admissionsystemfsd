import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

const ALLOWED_STATUSES = ["VERIFIED", "REJECTED"];
const STATUS_OPTIONS = [
  { value: "VERIFIED", label: "Verified", disabled: false },
  { value: "REJECTED", label: "Rejected", disabled: false },
];

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
  const [docReviews, setDocReviews] = useState({});

  const formatStatus = (value) => value?.toString().replace(/_/g, " ");
  const formatValue = (value) => (value === null || value === undefined || value === "" ? "-" : value);
  const hasValue = (value) => value !== null && value !== undefined && value !== "";
  const isPwdTrue = application?.isPwd === true;
  const pwdStatus =
    application?.isPwd === true ? "Yes" : application?.isPwd === false ? "No" : "-";
  const branchValue = application?.branch?.code || application?.branch?.name || application?.branchAllotted || "-";
  const batchValue =
    application?.batch?.name ||
    application?.batch?.code ||
    application?.batch?.label ||
    application?.batch?.year ||
    "-";

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

  const buildDocReviewSummary = (docs) => {
    if (!docs?.length) return "";
    const lines = docs
      .map((doc) => {
        const review = docReviews[doc.id];
        if (review?.status !== "REJECTED") return null;
        const reason = review.reason?.trim() ? ` (Reason: ${review.reason.trim()})` : "";
        return `${doc.documentType}${reason}`;
      })
      .filter(Boolean);
    return lines.length ? `Rejected Documents:\n${lines.join("\n")}` : "";
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!ALLOWED_STATUSES.includes(status)) {
      setError("Please select a valid verification status");
      return;
    }
    setSubmitting(true);

    try {
      const reviewSummary = buildDocReviewSummary(application?.documents || []);
      const combinedComments = [comments?.trim(), reviewSummary].filter(Boolean).join("\n\n");

      await API.post(`/verifier/review`, {
        applicationId: id,
        status,
        comments: combinedComments,
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

  const handleDocStatus = (docId, nextStatus) => {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], status: nextStatus },
    }));
  };

  const handleDocReason = (docId, reason) => {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], reason },
    }));
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
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-sm">
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

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Applicant Overview</p>
            <span className="text-xs text-app-muted">Summary</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-app-muted">Application ID</p>
              <p className="font-medium text-app-primary">{formatValue(application.id)}</p>
            </div>
            <div>
              <p className="text-xs text-app-muted">Email</p>
              <p className="font-medium text-app-primary">{formatValue(application.user?.email)}</p>
            </div>
            <div>
              <p className="text-xs text-app-muted">Application Status</p>
              <span
                className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  application.applicationStatus === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : application.applicationStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {formatStatus(application.applicationStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Basic Info</p>
                  <span className="text-xs text-app-muted">Profile</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Name</p>
                    <p className="font-medium text-app-primary">{formatValue(application.name)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Date of Birth</p>
                    <p className="font-medium text-app-primary">
                      {application.dateOfBirth ? new Date(application.dateOfBirth).toDateString() : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Gender</p>
                    <p className="font-medium text-app-primary">{formatValue(formatStatus(application.gender))}</p>
                  </div>
                </div>
              </div>

              <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Academic Info</p>
                  <span className="text-xs text-app-muted">Allocation</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Branch</p>
                    <p className="font-medium text-app-primary">{formatValue(branchValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Batch</p>
                    <p className="font-medium text-app-primary">{formatValue(batchValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Seat Allotment Source</p>
                    <p className="font-medium text-app-primary">{formatValue(application.seatAllotmentSource)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Caste Category</p>
                    <p className="font-medium text-app-primary">{formatValue(formatStatus(application.casteCategory))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Religion</p>
                    <p className="font-medium text-app-primary">{formatValue(application.religion)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Blood Group</p>
                    <p className="font-medium text-app-primary">{formatValue(application.bloodGroup)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Aadhar Number</p>
                    <p className="font-medium text-app-primary">{formatValue(application.aadharNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Student Remarks</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(application.remarksFromStudent)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Contact Info</p>
                  <span className="text-xs text-app-muted">Primary</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Contact Number</p>
                    <p className="font-medium text-app-primary">{formatValue(application.contactNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Name</p>
                    <p className="font-medium text-app-primary">{formatValue(application.guardianName)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Number</p>
                    <p className="font-medium text-app-primary">{formatValue(application.guardianNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Email</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(application.guardianEmail)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-app-muted">Address</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(application.permanentAddress)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">State</p>
                    <p className="font-medium text-app-primary">{formatValue(application.state)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                  Admission & Ranking Details
                </p>
                <span className="text-xs text-app-muted">Extended</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-app-muted">JEE Main Rank</p>
                  <p className="font-medium text-app-primary">{formatValue(application.jeeMainRank)}</p>
                </div>
                <div>
                  <p className="text-xs text-app-muted">JEE Main Category Rank</p>
                  <p className="font-medium text-app-primary">{formatValue(application.jeeMainCategoryRank)}</p>
                </div>
                <div>
                  <p className="text-xs text-app-muted">PWD Status</p>
                  <p className="font-medium text-app-primary">{pwdStatus}</p>
                </div>
                {isPwdTrue && (
                  <div>
                    <p className="text-xs text-app-muted">PWD Disability Type</p>
                    <p className="font-medium text-app-primary">{formatValue(application.pwdDisabilityType)}</p>
                  </div>
                )}
                {hasValue(application.jeeAdvancedRank) && (
                  <div>
                    <p className="text-xs text-app-muted">JEE Advanced Rank</p>
                    <p className="font-medium text-app-primary">{application.jeeAdvancedRank}</p>
                  </div>
                )}
                {hasValue(application.jeeAdvancedCategoryRank) && (
                  <div>
                    <p className="text-xs text-app-muted">JEE Advanced Category Rank</p>
                    <p className="font-medium text-app-primary">{application.jeeAdvancedCategoryRank}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                  Documents
                </p>
                <span className="text-xs text-app-muted">Uploads</span>
              </div>
              <div className="space-y-4">
                {(application.documents || []).map((doc) => {
                  const review = docReviews[doc.id] || {};
                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-app-border bg-white/80 px-4 py-4 space-y-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-800">{formatStatus(doc.documentType)}</p>
                        </div>
                        <div className="flex items-center justify-end h-full">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="border border-blue-200 bg-white text-blue-900 hover:bg-blue-900 hover:border-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200"
                          >
                            Download
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleDocStatus(doc.id, "APPROVED")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                            review.status === "APPROVED"
                              ? "bg-green-100 border-green-200 text-green-700"
                              : "border-gray-200 text-gray-600 hover:bg-green-50"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocStatus(doc.id, "REJECTED")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                            review.status === "REJECTED"
                              ? "bg-red-100 border-red-200 text-red-700"
                              : "border-gray-200 text-gray-600 hover:bg-red-50"
                          }`}
                        >
                          Reject
                        </button>
                      </div>

                      {review.status === "REJECTED" && (
                        <div>
                          <label className="text-xs text-gray-600">Rejection Reason</label>
                          <input
                            value={review.reason || ""}
                            onChange={(e) => handleDocReason(doc.id, e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            placeholder="Reason for rejection"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                  Verification Actions
                </p>
                <span className="text-xs text-app-muted">Review</span>
              </div>
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Application Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Add verification remarks..."
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
      </div>
    </div>
  );
}