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

  const pageClasses = "min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12";
  const cardClasses =
    "max-w-4xl w-full bg-white border border-gray-200 rounded-2xl shadow-md p-8 md:p-12 text-center space-y-6";
  const titleClasses = "text-3xl md:text-4xl font-bold text-blue-900";
  const subtitleClasses = "text-gray-600 text-sm md:text-base max-w-2xl mx-auto";
  const primaryButtonClasses =
    "bg-blue-900 text-white hover:bg-blue-800 rounded-md px-6 py-2.5 text-sm font-medium transition shadow-sm";
  const outlineButtonClasses =
    "border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-6 py-2.5 text-sm font-medium transition";

  return (
    <div className={pageClasses}>
      <div className={cardClasses}>
        <div className="space-y-3">
          <h1 className={titleClasses}>IIIT Dharwad Admission Portal</h1>
          <p className={subtitleClasses}>
            A centralized system for admissions, verification, and assignments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">For Students</p>
            <p className="text-sm text-gray-600 mt-2">
              Register for admission, submit documents, and track application status.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">For Admins</p>
            <p className="text-sm text-gray-600 mt-2">
              Review applications, assign verifiers, and monitor progress.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">For Verifiers</p>
            <p className="text-sm text-gray-600 mt-2">
              Verify documents, approve or reject applications, and submit remarks.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link to="/login" className={primaryButtonClasses}>
            Login
          </Link>
          <Link to="/signup" className={outlineButtonClasses}>
            Signup
          </Link>
          <Link to="/dashboard" className={primaryButtonClasses}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}