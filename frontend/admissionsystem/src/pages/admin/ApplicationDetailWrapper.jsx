import { useParams } from "react-router-dom";
import ApplicationDetail from "../../components/admin/ApplicationDetail";

export default function ApplicationDetailWrapper() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ApplicationDetail applicationId={id} />
      </div>
    </div>
  );
}