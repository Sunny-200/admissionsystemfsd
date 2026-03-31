import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VerifierApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("PENDING");
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
        setApplication(res.data.application);
        setStatus(res.data.application?.verificationStatus || "PENDING");
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
    setSubmitting(true);

    try {
      const res = await API.post(`/verifier/applications/${id}/verify`, {
        status,
        comments,
      });
      alert("Verification submitted successfully!");
      navigate("/verifier");
    } catch (err) {
      console.error(err);
      setError("Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading application details...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        <button
          onClick={() => navigate("/verifier")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!application) {
    return <div className="p-6 text-center">Application not found</div>;
  }

  return (
    <div className="page-container">
      <div className="card-base p-6 mb-6">
        <button
          onClick={() => navigate("/verifier")}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-4">
          Application Details - {application.firstName} {application.lastName}
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="font-semibold text-gray-700">Student ID:</label>
            <p>{application.studentId}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Email:</label>
            <p>{application.email}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Phone:</label>
            <p>{application.phone}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Date of Birth:</label>
            <p>{application.dateOfBirth}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Gender:</label>
            <p>{application.gender}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">
              Application Status:
            </label>
            <p>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  application.applicationStatus === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : application.applicationStatus === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {application.applicationStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Academic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-gray-700">
                High School:
              </label>
              <p>{application.highSchoolName}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Board:</label>
              <p>{application.highSchoolBoard}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Passing Year:</label>
              <p>{application.passingYear}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">CGPA:</label>
              <p>{application.cgpa}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Subjects:</label>
              <p>{application.subjects?.join(", ")}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">
                Preferred Stream:
              </label>
              <p>{application.preferredStream}</p>
            </div>
          </div>
        </div>

        {application.achievements && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            <p>{application.achievements}</p>
          </div>
        )}
      </div>

      <div className="card-base p-6">
        <h2 className="text-2xl font-bold mb-4">Verification Form</h2>

        <form onSubmit={handleSubmitVerification}>
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Verification Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border rounded px-3 py-2 h-32"
              placeholder="Add verification comments..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}