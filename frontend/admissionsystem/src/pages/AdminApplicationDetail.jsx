import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

import ApplicationDetail from "../components/admin/ApplicationDetail";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.role !== "ADMIN") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ApplicationDetail applicationId={id} />
      </div>
    </div>
  );
}