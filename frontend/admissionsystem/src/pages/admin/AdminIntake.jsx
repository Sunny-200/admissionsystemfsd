import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/authContext";

const parseIntakeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.intake)) return payload.data.intake;
  if (Array.isArray(payload?.intake)) return payload.intake;
  return [];
};

const parseBatchYears = (payload) => {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.batches)
        ? payload.data.batches
        : Array.isArray(payload?.batches)
          ? payload.batches
          : [];

  return Array.from(
    new Set(
      raw
        .map((item) => {
          if (typeof item === "string" || typeof item === "number") {
            return String(item);
          }
          return String(item?.year || item?.startYear || item?.code || "");
        })
        .map((year) => year.trim())
        .filter((year) => /^\d{4}$/.test(year))
    )
  ).sort((left, right) => Number(right) - Number(left));
};

export default function AdminIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      return;
    }

    let cancelled = false;

    const fetchBatches = async () => {
      try {
        const response = await API.get("/admin/batches");
        const years = parseBatchYears(response?.data);

        if (cancelled) return;
        setBatches(years);
        setSelectedBatch((current) => current || years[0] || "");
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load batches");
          setBatches([]);
          setSelectedBatch("");
          setLoading(false);
        }
      }
    };

    fetchBatches();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      return;
    }

    if (!selectedBatch) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchIntake = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/intake", {
          params: { batch: selectedBatch },
        });
        const intakeRows = parseIntakeRows(response?.data)
          .map((row) => ({
            batchYear: Number(row?.batchYear || 0),
            branch: String(row?.branch || "").trim().toUpperCase(),
            intake: Number(row?.intake || 0),
          }))
          .filter((row) => row.batchYear > 0 && row.branch)
          .sort((left, right) => left.branch.localeCompare(right.branch));

        if (cancelled) return;
        setRows(intakeRows);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load intake data");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchIntake();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch, user]);

  const handleIntakeChange = (index, value) => {
    setRows((prev) =>
      prev.map((row, currentIndex) =>
        currentIndex === index
          ? { ...row, intake: Math.max(0, Number(value === "" ? 0 : value)) }
          : row
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      await API.post("/admin/intake", rows);
      alert("Intake updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save intake");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">Manage Intake</h1>
            <p className="text-sm text-app-muted mt-1">Update branch-wise intake by batch</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Back
          </button>
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-app-muted">Batch</p>
              <select
                value={selectedBatch}
                onChange={(event) => setSelectedBatch(event.target.value)}
                className="bg-white border border-app-border rounded-md px-3 py-2 text-sm text-app-primary"
                disabled={batches.length === 0 || loading || saving}
              >
                {batches.length === 0 && <option value="">No batches</option>}
                {batches.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading || rows.length === 0 || !selectedBatch}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {loading && <p className="text-sm text-app-muted">Loading intake data...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="text-sm text-app-muted">No intake rows available.</p>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="overflow-x-auto border border-app-border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium border-b border-app-border">Branch</th>
                    <th className="text-left px-4 py-3 font-medium border-b border-app-border">Intake</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.batchYear}-${row.branch}`} className="border-b border-app-border last:border-b-0">
                      <td className="px-4 py-3 text-gray-900 font-medium">{row.branch}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={row.intake}
                          onChange={(event) => handleIntakeChange(index, event.target.value)}
                          className="form-input w-24"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
