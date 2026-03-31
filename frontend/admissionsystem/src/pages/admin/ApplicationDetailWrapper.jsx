import { useParams } from "react-router-dom";
import ApplicationDetail from "../../components/admin/ApplicationDetail";

export default function ApplicationDetailWrapper() {
  const { id } = useParams();

  return <ApplicationDetail applicationId={id} />;
}