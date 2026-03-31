import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "VERIFIER") {
        navigate("/verifier");
      } else if (user.role === "STUDENT") {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
          IIIT Dharwad Admission Portal
        </h1>
        <p className="text-sm text-app-muted mt-1 mb-6">
          A centralized system for admissions, verification, and assignments
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                For Students
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Register for admission, submit documents, and track application status.
            </p>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                For Admins
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Review applications, assign verifiers, and monitor progress.
            </p>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
              <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                For Verifiers
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Verify documents, approve or reject applications, and submit remarks.
            </p>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}