import { useEffect, useMemo, useState } from "react";
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
  const [selectedBatch, setSelectedBatch] = useState("ALL");

  const getBatchValue = (app) => {
    if (app?.batch?.startYear) return String(app.batch.startYear);
    if (app?.batch?.year) return String(app.batch.year);
    if (app?.batchYear) return String(app.batchYear);
    if (app?.batch?.code) return String(app.batch.code);
    if (app?.batch?.name) {
      const yearMatch = String(app.batch.name).match(/\b(20\d{2})\b/);
      return yearMatch ? yearMatch[1] : String(app.batch.name);
    }
    return "";
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await API.get("/admin/applications");
      const apps = res.data.data.applications || [];
      setApplications(apps);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    const appBatchValue = getBatchValue(app);

    return (
      (app.name.toLowerCase().includes(query) ||
        app.user.email.toLowerCase().includes(query) ||
        app.branchAllotted.toLowerCase().includes(query)) &&
      (statusFilter === "ALL" || app.applicationStatus === statusFilter) &&
      (branchFilter === "ALL" || app.branchAllotted === branchFilter) &&
      (selectedBatch === "ALL" || appBatchValue === selectedBatch)
    );
  });

  const uniqueBranches = [...new Set(applications.map(a => a.branchAllotted))];
  const uniqueStatuses = [...new Set(applications.map(a => a.applicationStatus))];
  const batchOptions = useMemo(
    () => [...new Set(applications.map((app) => getBatchValue(app)).filter(Boolean))],
    [applications]
  );

  useEffect(() => {
  }, [applications, batchOptions]);

  if (loading) return <p className="text-sm text-gray-600">Loading...</p>;

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

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="ALL">All Batches</option>
          {batchOptions.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-blue-50 text-blue-900 uppercase text-xs tracking-wide">
            <tr>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Branch</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-4 text-sm text-gray-700">{app.name}</td>
                <td className="p-4 text-sm text-gray-700">{app.user.email}</td>
                <td className="p-4 text-sm text-gray-700">{app.branchAllotted}</td>
                <td className="p-4 text-sm text-gray-700">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.applicationStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : app.applicationStatus === "IN_REVIEW"
                        ? "bg-blue-100 text-blue-800"
                        : app.applicationStatus === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.applicationStatus}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <button
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-sm"
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