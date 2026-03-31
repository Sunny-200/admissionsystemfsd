import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function AdminApplicationsTable() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await API.get("/admin/applications");
      setApplications(res.data.data.applications);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();

    return (
      (app.name.toLowerCase().includes(query) ||
        app.user.email.toLowerCase().includes(query) ||
        app.branchAllotted.toLowerCase().includes(query)) &&
      (statusFilter === "ALL" || app.applicationStatus === statusFilter) &&
      (branchFilter === "ALL" || app.branchAllotted === branchFilter)
    );
  });

  const uniqueBranches = [...new Set(applications.map(a => a.branchAllotted))];
  const uniqueStatuses = [...new Set(applications.map(a => a.applicationStatus))];

  if (loading) return <p className="text-sm text-app-muted">Loading...</p>;

  if (error) return <p className="text-red-600 text-sm">{error}</p>;

  return (
    <div className="space-y-6">
      <input
        placeholder="Search by name, email, or branch"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
      />

      <div className="flex flex-col md:flex-row gap-3">
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="ALL">All Status</option>
          {uniqueStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          onChange={(e) => setBranchFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="ALL">All Branch</option>
          {uniqueBranches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="bg-app-card border border-app-border rounded-xl overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-4 text-sm border-b border-app-border">Name</th>
              <th className="p-4 text-sm border-b border-app-border">Email</th>
              <th className="p-4 text-sm border-b border-app-border">Branch</th>
              <th className="p-4 text-sm border-b border-app-border">Status</th>
              <th className="p-4 text-sm border-b border-app-border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm border-b border-app-border">{app.name}</td>
                <td className="p-4 text-sm border-b border-app-border">{app.user.email}</td>
                <td className="p-4 text-sm border-b border-app-border">{app.branchAllotted}</td>
                <td className="p-4 text-sm border-b border-app-border">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {app.applicationStatus}
                  </span>
                </td>
                <td className="p-4 text-sm border-b border-app-border">
                  <button
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="border border-app-primary text-app-primary hover:bg-app-primary hover:text-white rounded-md px-4 py-2 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}