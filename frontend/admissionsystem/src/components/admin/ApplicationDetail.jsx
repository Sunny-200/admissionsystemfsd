import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function ApplicationDetail({ applicationId }) {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedVerifier, setAssignedVerifier] = useState(null);

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
  const documentStatusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    APPROVED: "bg-green-100 text-green-800 border border-green-200",
    REJECTED: "bg-red-100 text-red-800 border border-red-200",
    SUPERSEDED: "bg-gray-100 text-gray-700 border border-gray-200",
  };

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

  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        const res = await API.get("/admin/assignments");
        const assignments = res.data.data.applications || [];
        const current = assignments.find((app) => app.id === applicationId);
        setAssignedVerifier(current?.assignedVerifier || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVerifiers();
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
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-sm">
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
                  : application.applicationStatus === "IN_REVIEW"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {formatStatus(application.applicationStatus)}
            </span>
          </div>
          <div>
            <p className="text-xs text-app-muted">User Created</p>
            <p className="font-medium text-app-primary">
              {application.user?.createdAt ? new Date(application.user.createdAt).toLocaleDateString() : "-"}
            </p>
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
              {(application.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-xl border border-app-border bg-white/80 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800">{formatStatus(doc.documentType)}</p>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex w-fit ${
                        documentStatusClasses[doc.status] ||
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {formatStatus(doc.status) || "Pending"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="border border-blue-200 bg-white text-blue-900 hover:bg-blue-900 hover:border-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                Current Verifier
              </p>
              <span className="text-xs text-app-muted">Assignments</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-app-muted">Verifier Name</p>
              <p className="text-sm font-medium text-app-primary">
                {assignedVerifier?.name || "Unassigned"}
              </p>
              <p className="text-sm text-app-muted">Verifier Email</p>
              <p className="text-sm font-medium text-app-primary">
                {assignedVerifier?.email || "-"}
              </p>
            </div>
          </div>

          {/* <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                Remarks
              </p>
              <span className="text-xs text-app-muted">History</span>
            </div>
            <div className="space-y-4">
              {(application.remarks || []).length === 0 && (
                <p className="text-sm text-app-muted">No remarks yet.</p>
              )}
              {(application.remarks || []).map((remark) => (
                <div key={remark.id} className="rounded-xl border border-app-border bg-white/80 p-4">
                  <p className="text-sm text-gray-700">{remark.text}</p>
                  <p className="text-xs text-app-muted mt-2">
                    {remark.author?.name || "Unknown"} · {new Date(remark.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}