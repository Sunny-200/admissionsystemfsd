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
  if (loading) return <p className="text-sm text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className={`max-w-7xl mx-auto space-y-6 ${selectedApps.length > 0 ? "pb-32" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">
              Verifier Assignments
            </h1>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Assign applications to verifiers and track status
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Back
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 space-y-4">

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>

              <select
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-blue-50 text-blue-900 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="p-4 text-left font-medium">
                      <input
                        type="checkbox"
                        onChange={toggleAll}
                        checked={filteredApps.length > 0 && selectedApps.length === filteredApps.length}
                      />
                    </th>
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Email</th>
                    <th className="p-4 text-left font-medium">Branch</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Verifier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => toggleApp(app.id)}
                      className={`border-b border-gray-200 transition cursor-pointer ${
                        selectedApps.includes(app.id) ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-4 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.id)}
                          onChange={() => toggleApp(app.id)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-700">{app.name}</td>
                      <td className="p-4 text-sm text-gray-700">{app.email}</td>
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
                        {app.assignedVerifier ? app.assignedVerifier.email : "Unassigned"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedApps.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] md:w-[min(1024px,calc(100%-4rem))]">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="text-xs md:text-sm text-gray-700 font-medium whitespace-nowrap">
                {selectedApps.length} selected
              </div>

              <select
                value={selectedVerifier}
                onChange={(e) => setSelectedVerifier(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
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
                className="bg-blue-900 text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-60"
              >
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}