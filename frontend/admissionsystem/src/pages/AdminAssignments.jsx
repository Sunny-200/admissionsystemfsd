import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/authContext";

export default function AdminAssignments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");

  // 🔐 protect route
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // 📦 fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, verifiersRes] = await Promise.all([
          API.get("/admin/assignments"),
          API.get("/admin/verifiers"),
        ]);

        setApplications(appsRes.data.data.applications || []);
        setVerifiers(verifiersRes.data.data.verifiers || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🎯 filters
  const filteredApps = applications.filter((app) => {
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "assigned" && app.assignedVerifier) ||
      (filterStatus === "unassigned" && !app.assignedVerifier);

    const branchMatch =
      filterBranch === "all" || app.branchAllotted === filterBranch;

    return statusMatch && branchMatch;
  });

  const branches = [...new Set(applications.map((a) => a.branchAllotted))];

  // ✅ selection
  const toggleApp = (id) => {
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedApps.length === filteredApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map((a) => a.id));
    }
  };

  // 🚀 assign
  const handleAssign = async () => {
    if (!selectedVerifier) return alert("Select verifier");
    if (selectedApps.length === 0) return alert("Select applications");

    setAssigning(true);

    try {
      const res = await API.post("/admin/assignments/bulk", {
        applicationIds: selectedApps,
        verifierId: selectedVerifier,
      });

      alert(res.data.data?.message || "Assigned successfully");

      setSelectedApps([]);
      setSelectedVerifier("");

      const updated = await API.get("/admin/assignments");
      setApplications(updated.data.data.applications);

    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // 🧾 UI
  if (loading) return <p className="text-sm text-app-muted">Loading...</p>;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
          Verifier Assignments
        </h1>
        <p className="text-sm text-app-muted mt-1 mb-6">
          Assign applications to verifiers and track status
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Assignment List
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>

            <select
              onChange={(e) => setFilterBranch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="bg-app-card border border-app-border rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-4 text-sm border-b border-app-border">
                    <input
                      type="checkbox"
                      onChange={toggleAll}
                      checked={selectedApps.length === filteredApps.length}
                    />
                  </th>
                  <th className="p-4 text-sm border-b border-app-border">Name</th>
                  <th className="p-4 text-sm border-b border-app-border">Email</th>
                  <th className="p-4 text-sm border-b border-app-border">Branch</th>
                  <th className="p-4 text-sm border-b border-app-border">Status</th>
                  <th className="p-4 text-sm border-b border-app-border">Verifier</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm border-b border-app-border">
                      <input
                        type="checkbox"
                        checked={selectedApps.includes(app.id)}
                        onChange={() => toggleApp(app.id)}
                      />
                    </td>
                    <td className="p-4 text-sm border-b border-app-border">{app.name}</td>
                    <td className="p-4 text-sm border-b border-app-border">{app.email}</td>
                    <td className="p-4 text-sm border-b border-app-border">{app.branchAllotted}</td>
                    <td className="p-4 text-sm border-b border-app-border">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm border-b border-app-border">
                      {app.assignedVerifier ? app.assignedVerifier.email : "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedApps.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <select
                value={selectedVerifier}
                onChange={(e) => setSelectedVerifier(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Verifier</option>
                {verifiers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name || v.email}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
              >
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}