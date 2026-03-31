import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-3xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            IIIT Dharwad Admission System
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A centralized platform for managing student admissions, verifications, and assignments
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">For Students</h3>
            <p className="text-gray-600">
              Register for admission, view your application status, and track progress
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">For Admins</h3>
            <p className="text-gray-600">
              Manage applications, assign verifiers, and oversee the entire admission process
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">For Verifiers</h3>
            <p className="text-gray-600">
              Verify student information and approve applications efficiently
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-8 py-3 transition shadow-lg"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg px-8 py-3 transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 text-gray-600 text-sm">
          <p>© 2026 IIIT Dharwad. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}