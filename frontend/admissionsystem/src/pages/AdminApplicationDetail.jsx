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
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <ApplicationDetail applicationId={id} />
      </div>
    </div>
  );
}