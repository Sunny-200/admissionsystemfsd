import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
  }, [user]);

  // 📦 fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, verifiersRes] = await Promise.all([
          API.get("/admin/assignments"),
          API.get("/admin/verifiers"),
        ]);

        setApplications(appsRes.data.applications || []);
        setVerifiers(verifiersRes.data.verifiers || []);
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

      alert(res.data.message || "Assigned successfully");

      setSelectedApps([]);
      setSelectedVerifier("");

      const updated = await API.get("/admin/assignments");
      setApplications(updated.data.applications);

    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // 🧾 UI
  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Verifier Assignments</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <select onChange={(e) => setFilterBranch(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={toggleAll}
                checked={selectedApps.length === filteredApps.length}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Verifier</th>
          </tr>
        </thead>

        <tbody>
          {filteredApps.map((app) => (
            <tr key={app.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedApps.includes(app.id)}
                  onChange={() => toggleApp(app.id)}
                />
              </td>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.branchAllotted}</td>
              <td>{app.applicationStatus}</td>
              <td>
                {app.assignedVerifier
                  ? app.assignedVerifier.email
                  : "Unassigned"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk Assign */}
      {selectedApps.length > 0 && (
        <div className="mt-4 flex gap-3">
          <select
            value={selectedVerifier}
            onChange={(e) => setSelectedVerifier(e.target.value)}
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
            className="bg-blue-600 text-white px-4 py-2"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      )}
    </div>
  );
}