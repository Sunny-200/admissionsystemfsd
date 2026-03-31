import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="p-6">
      <ApplicationDetail applicationId={id} />
    </div>
  );
}