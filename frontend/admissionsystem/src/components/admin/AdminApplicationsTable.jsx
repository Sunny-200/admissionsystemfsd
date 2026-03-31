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
      setApplications(res.data.applications);
    } catch (err) {
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

  if (loading) return <p className="text-center py-6">Loading...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 w-full"
      />

      {/* FILTERS */}
      <div className="flex gap-3">
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          {uniqueStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="ALL">All Branch</option>
          {uniqueBranches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredApplications.map((app) => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{app.user.email}</td>
              <td>{app.branchAllotted}</td>
              <td>{app.applicationStatus}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/applications/${app.id}`)
                  }
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}