import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "../../api/axios";
import { useAuth } from "../../context/authContext";

const getFillColor = (fillRate) => {
  if (fillRate >= 80) return "#16a34a";
  if (fillRate >= 50) return "#f59e0b";
  return "#dc2626";
};

const parseStatsRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.stats)) return payload.data.stats;
  if (Array.isArray(payload?.data?.branches)) return payload.data.branches;
  if (Array.isArray(payload?.stats)) return payload.stats;
  if (Array.isArray(payload?.branches)) return payload.branches;
  return [];
};

const CapLabel = ({ x, y, width }) => {
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") {
    return null;
  }

  return (
    <line
      x1={x + 2}
      y1={y + 0.5}
      x2={x + width - 2}
      y2={y + 0.5}
      stroke="#6b7280"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
};

const PercentageLabel = ({ x, y, width, value }) => {
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    value === undefined ||
    value === null
  ) {
    return null;
  }

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill="#374151"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

const BranchTooltip = ({ active, payload }) => {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-medium text-gray-900">
        {data.branch}: {data.admitted} / {data.intake} admitted
      </p>
      <p className="text-xs text-gray-600">
        {data.vacant} vacant · {data.fillRate}% filled
      </p>
    </div>
  );
};

const GenderTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  const male = Number(row?.male || 0);
  const female = Number(row?.female || 0);
  const other = Number(row?.other || 0);
  const total = male + female + other;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{label || row?.branch || "-"}</p>
      <p className="text-xs text-gray-700 mt-1">Male: {male}</p>
      <p className="text-xs text-gray-700">Female: {female}</p>
      <p className="text-xs text-gray-700">Other: {other}</p>
      <p className="text-xs font-medium text-gray-900 mt-1">Total: {total}</p>
    </div>
  );
};

export default function AdminStatistics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genderStats, setGenderStats] = useState([]);
  const [genderLoading, setGenderLoading] = useState(true);
  const [genderError, setGenderError] = useState("");

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
    let cancelled = false;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/stats/branch");
        const rows = parseStatsRows(response?.data);

        if (cancelled) return;

        const normalized = rows.map((row) => {
          const intake = Number(row?.intake || 0);
          const admittedRaw = Number(row?.admitted || 0);
          const admitted = Math.max(admittedRaw, 0);
          const vacant = Math.max(intake - admitted, 0);
          const fillRate = intake > 0 ? Math.round((admitted / intake) * 100) : 0;

          return {
            branch: row?.branch || "-",
            intake,
            admitted,
            vacant,
            fillRate,
            fillRateLabel: `${fillRate}%`,
          };
        });

        setStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load branch statistics");
          setStats([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGenderStats = async () => {
      try {
        setGenderLoading(true);
        setGenderError("");

        const response = await API.get("/admin/stats/gender");
        const rows = parseStatsRows(response?.data);

        if (cancelled) return;

        const normalized = rows.map((row) => {
          const male = Number(row?.male || 0);
          const female = Number(row?.female || 0);
          const other = Number(row?.other || 0);

          return {
            branch: row?.branch || "-",
            male: Math.max(male, 0),
            female: Math.max(female, 0),
            other: Math.max(other, 0),
          };
        });

        setGenderStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setGenderError(err.response?.data?.message || "Failed to load gender statistics");
          setGenderStats([]);
        }
      } finally {
        if (!cancelled) {
          setGenderLoading(false);
        }
      }
    };

    loadGenderStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => stats, [stats]);
  const genderChartData = useMemo(() => genderStats, [genderStats]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">Admin Statistics</h1>
            <p className="text-sm text-app-muted mt-1">Branch-wise admission capacity overview</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-app-primary">Branch-wise Distribution</h2>
            </div>

            {loading && <p className="text-sm text-app-muted">Loading statistics...</p>}
            {!loading && error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && chartData.length === 0 && (
              <p className="text-sm text-app-muted">No branch statistics available.</p>
            )}

            {!loading && !error && chartData.length > 0 && (
              <div className="w-full min-w-0">
                <ResponsiveContainer width="100%" height={360} minWidth={0}>
                  <BarChart data={chartData} barCategoryGap="35%" barGap={-28}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: "#4b5563", fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#f9fafb" }} content={<BranchTooltip />} />

                    <Bar dataKey="intake" fill="#e5e7eb" radius={[8, 8, 0, 0]} barSize={28}>
                      <LabelList content={<CapLabel />} />
                    </Bar>

                    <Bar dataKey="admitted" radius={[8, 8, 0, 0]} barSize={28}>
                      {chartData.map((entry) => (
                        <Cell key={`admitted-${entry.branch}`} fill={getFillColor(entry.fillRate)} />
                      ))}
                      <LabelList dataKey="fillRateLabel" content={<PercentageLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-app-primary">Gender Distribution per Branch</h2>
            </div>

            {genderLoading && <p className="text-sm text-app-muted">Loading gender statistics...</p>}
            {!genderLoading && genderError && <p className="text-sm text-red-600">{genderError}</p>}
            {!genderLoading && !genderError && genderChartData.length === 0 && (
              <p className="text-sm text-app-muted">No gender statistics available.</p>
            )}

            {!genderLoading && !genderError && genderChartData.length > 0 && (
              <div className="w-full min-w-0">
                <ResponsiveContainer width="100%" height={360} minWidth={0}>
                  <BarChart data={genderChartData} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="branch"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: "#f9fafb" }} content={<GenderTooltip />} />
                    <Legend verticalAlign="top" align="center" height={28} />
                    <Bar dataKey="male" stackId="a" name="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="female" stackId="a" name="Female" fill="#ec4899" />
                    <Bar dataKey="other" stackId="a" name="Other" fill="#9ca3af" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
