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
  const formatStatus = (value) => value?.toString().replace(/_/g, " ");
  const formatValue = (value) => (value === null || value === undefined || value === "" ? "-" : value);
  const hasValue = (value) => value !== null && value !== undefined && value !== "";
  const isPwdTrue = profile?.isPwd === true;
  const pwdStatus =
    profile?.isPwd === true ? "Yes" : profile?.isPwd === false ? "No" : "-";
  const branchValue = profile?.branch?.code || profile?.branch?.name || "-";
  const batchValue =
    profile?.batch?.name ||
    profile?.batch?.code ||
    profile?.batch?.label ||
    (profile?.batch?.startYear ? `Batch ${profile.batch.startYear}` : null) ||
    profile?.batch?.year ||
    profile?.batch?.startYear ||
    "-";
  const applicationStatusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    IN_REVIEW: "bg-blue-100 text-blue-800 border border-blue-200",
    DOCUMENTS_REJECTED: "bg-red-100 text-red-800 border border-red-200",
    VERIFIED: "bg-green-100 text-green-800 border border-green-200",
    FEE_PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
    CONFIRMED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    REJECTED: "bg-red-100 text-red-800 border border-red-200",
  };

  const extractRemarkSections = (remarkTextValue) => {
    const rawText = String(remarkTextValue || "").trim();
    const marker = "Rejected Documents:";
    const markerIndex = rawText.indexOf(marker);

    if (markerIndex === -1) {
      return {
        remarkText: rawText || "-",
        rejectedDocs: [],
      };
    }

    const mainRemarkText = rawText.slice(0, markerIndex).trim();
    const rejectedRaw = rawText.slice(markerIndex + marker.length).trim();

    if (!rejectedRaw) {
      return {
        remarkText: mainRemarkText || "-",
        rejectedDocs: [],
      };
    }

    const patternMatches = Array.from(
      rejectedRaw.matchAll(/([A-Z0-9_]+)\s*\(Reason:\s*([^)]+)\)/gi)
    );

    const rejectedDocs = patternMatches.length > 0
      ? patternMatches.map((match) => ({
          type: String(match[1] || "").trim(),
          reason: String(match[2] || "").trim(),
        }))
      : rejectedRaw
          .split(/[,;\n]+/)
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry) => {
            const reasonMatch = entry.match(/(.+?)\s*\(Reason:\s*([^)]+)\)/i);
            if (reasonMatch) {
              return {
                type: String(reasonMatch[1] || "").replace(/^[-•]\s*/, "").trim(),
                reason: String(reasonMatch[2] || "").trim(),
              };
            }

            return {
              type: entry.replace(/^[-•]\s*/, "").trim(),
              reason: "",
            };
          });

    return {
      remarkText: mainRemarkText || "-",
      rejectedDocs,
    };
  };

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
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-lg w-full text-center space-y-4">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 mx-auto text-blue-900 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-8.25A2.25 2.25 0 0017.25 3.75h-7.5L4.5 9v9.75A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75v-1.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 9h5.25A2.25 2.25 0 0012 6.75V3.75"
                />
              </svg>
              <h1 className="text-xl font-semibold text-blue-900">No Application Found</h1>
              <p className="text-gray-600 text-sm">
                You have not submitted your admission form yet.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-900 text-white hover:bg-blue-800 px-5 py-2.5 rounded-md font-medium transition"
              >
                Complete Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">Student Dashboard</h1>
            <p className="text-sm text-app-muted mt-1">
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

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-blue-100">Application Status</p>
            <div className="flex items-center gap-3">
              <p className="text-xl font-semibold">{formatStatus(profile.applicationStatus)}</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  applicationStatusClasses[profile.applicationStatus] ||
                  "bg-white/20 text-white border border-white/30"
                }`}
              >
                {formatStatus(profile.applicationStatus)}
              </span>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            <p className="font-medium text-white">Welcome, {profile.name}</p>
            <p className="text-xs mt-1">
              Last updated {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "--"}
            </p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-app-card border border-app-border rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Basic Info</p>
                  <span className="text-xs text-app-muted">Profile</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Name</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.name)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Date of Birth</p>
                    <p className="font-medium text-app-primary">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toDateString() : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Gender</p>
                    <p className="font-medium text-app-primary">{formatValue(formatStatus(profile.gender))}</p>
                  </div>
                </div>
              </div>

              <div className="bg-app-card border border-app-border rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Academic Info</p>
                  <span className="text-xs text-app-muted">Allocation</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Branch</p>
                    <p className="font-medium text-app-primary">{formatValue(branchValue || profile.branchAllotted)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Batch</p>
                    <p className="font-medium text-app-primary">{formatValue(batchValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Seat Allotment Source</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.seatAllotmentSource)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Caste Category</p>
                    <p className="font-medium text-app-primary">{formatValue(formatStatus(profile.casteCategory))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Religion</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.religion)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Blood Group</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.bloodGroup)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Aadhar Number</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.aadharNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Student Remarks</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(profile.remarksFromStudent)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-app-card border border-app-border rounded-2xl shadow-sm p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Contact Info</p>
                  <span className="text-xs text-app-muted">Primary</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-app-muted">Contact Number</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.contactNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Name</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.guardianName)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Number</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.guardianNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">Guardian Email</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(profile.guardianEmail)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-app-muted">Address</p>
                    <p className="font-medium text-app-primary break-words">{formatValue(profile.permanentAddress)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-app-muted">State</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.state)}</p>
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
                  <p className="text-xs text-app-muted">PWD Status</p>
                  <p className="font-medium text-app-primary">{pwdStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-app-muted">JEE Main Rank</p>
                  <p className="font-medium text-app-primary">{formatValue(profile.jeeMainRank)}</p>
                </div>
                <div>
                  <p className="text-xs text-app-muted">JEE Main Category Rank</p>
                  <p className="font-medium text-app-primary">{formatValue(profile.jeeMainCategoryRank)}</p>
                </div>
                {isPwdTrue && (
                  <div>
                    <p className="text-xs text-app-muted">PWD Disability Type</p>
                    <p className="font-medium text-app-primary">{formatValue(profile.pwdDisabilityType)}</p>
                  </div>
                )}
                {hasValue(profile.jeeAdvancedRank) && (
                  <div>
                    <p className="text-xs text-app-muted">JEE Advanced Rank</p>
                    <p className="font-medium text-app-primary">{profile.jeeAdvancedRank}</p>
                  </div>
                )}
                {hasValue(profile.jeeAdvancedCategoryRank) && (
                  <div>
                    <p className="text-xs text-app-muted">JEE Advanced Category Rank</p>
                    <p className="font-medium text-app-primary">{profile.jeeAdvancedCategoryRank}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-app-card border border-app-border rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Documents</p>
                <span className="text-xs text-app-muted">Uploads</span>
              </div>
              <div className="space-y-3">
                {profile.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-xl border border-app-border bg-white/80 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-800">{formatStatus(doc.documentType)}</p>
                      {doc.status === "REJECTED" && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {doc.rejectionReason || "No reason provided"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="border border-blue-200 bg-white text-blue-900 hover:bg-blue-900 hover:border-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-app-card border border-app-border rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">Remarks</p>
                <span className="text-xs text-app-muted">Verifier</span>
              </div>
              <div className="space-y-4">
                {remarks.length === 0 && (
                  <p className="text-sm text-app-muted">No remarks yet.</p>
                )}
                {remarks.map((r) => (
                  (() => {
                    const { remarkText, rejectedDocs } = extractRemarkSections(r.text);

                    return (
                      <div key={r.id} className="rounded-xl border border-app-border bg-white/80 p-4 space-y-2">
                        <p className="text-sm text-app-primary font-medium">{remarkText}</p>

                        {rejectedDocs.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 font-semibold">Rejected Documents:</p>
                            <ul className="mt-1 space-y-1">
                              {rejectedDocs.map((doc, index) => (
                                <li key={`${r.id}-${doc.type}-${index}`} className="text-xs text-red-500">
                                  • {doc.type} (Reason: {doc.reason || "No reason provided"})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-xs text-app-muted mt-3">
                          {r.author?.name || "Verifier"} · {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })()
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-blue-900">Need help?</p>
              <p className="text-sm text-blue-800 mt-2">
                Reach out to the admissions office if you have any questions about your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}