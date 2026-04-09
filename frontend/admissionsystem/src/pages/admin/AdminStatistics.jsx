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
  Scatter,
  ScatterChart,
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

const formatCategoryLabel = (category) => {
  const normalized = String(category || "")
    .trim()
    .toUpperCase();

  const labels = {
    GENERAL: "General",
    GENERAL_EWS: "General-EWS",
    OBC_NCL: "OBC-NCL",
    SC: "SC",
    ST: "ST",
  };

  if (labels[normalized]) return labels[normalized];

  const fallback = String(category || "-")
    .trim()
    .replace(/_/g, " ");

  return fallback || "-";
};

const getCategoryColor = (category) => {
  const normalized = String(category || "")
    .trim()
    .toUpperCase();

  const colorMap = {
    GENERAL: "#3b82f6",
    GENERAL_EWS: "#22c55e",
    OBC_NCL: "#f97316",
    SC: "#ef4444",
    ST: "#8b5cf6",
    PWD: "#eab308",
  };

  return colorMap[normalized] || "#6b7280";
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

const StateTooltip = ({ active, payload }) => {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const row = payload[0].payload;
  const male = Number(row?.male || 0);
  const female = Number(row?.female || 0);
  const other = Number(row?.other || 0);
  const total = Number(row?.total || male + female + other);

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{row?.state || "-"}</p>
      <p className="text-xs text-gray-700 mt-1">Male: {male}</p>
      <p className="text-xs text-gray-700">Female: {female}</p>
      <p className="text-xs text-gray-700">Other: {other}</p>
      <p className="text-xs font-medium text-gray-900 mt-1">Total: {total}</p>
    </div>
  );
};

const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const row = payload[0].payload;
  const male = Number(row?.male || 0);
  const female = Number(row?.female || 0);
  const other = Number(row?.other || 0);
  const total = Number(row?.total || male + female + other);

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{row?.categoryLabel || "-"}</p>
      <p className="text-xs text-gray-700 mt-1">Male: {male}</p>
      <p className="text-xs text-gray-700">Female: {female}</p>
      <p className="text-xs text-gray-700">Other: {other}</p>
      <p className="text-xs font-medium text-gray-900 mt-1">Total: {total}</p>
    </div>
  );
};

const RankRangeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const row = payload[0].payload;
  const opening = Number(row?.openingRank || 0);
  const closing = Number(row?.closingRank || 0);

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">
        {row?.branch || "-"} / {row?.categoryLabel || "-"}
      </p>
      <p className="text-xs text-gray-700 mt-1">Opening: {opening.toLocaleString()}</p>
      <p className="text-xs text-gray-700">Closing: {closing.toLocaleString()}</p>
    </div>
  );
};

const parsePwdStats = (payload) => {
  const source = payload?.data || payload || {};
  const pwd = source.pwd || {};
  const nonPwd = source.nonPwd || {};

  const pwdMale = Math.max(Number(pwd.male || 0), 0);
  const pwdFemale = Math.max(Number(pwd.female || 0), 0);
  const pwdTotal = Math.max(Number(pwd.total || pwdMale + pwdFemale), 0);
  const pwdOther = Math.max(Number(pwd.other ?? pwdTotal - pwdMale - pwdFemale), 0);

  const nonPwdMale = Math.max(Number(nonPwd.male || 0), 0);
  const nonPwdFemale = Math.max(Number(nonPwd.female || 0), 0);
  const nonPwdTotal = Math.max(Number(nonPwd.total || nonPwdMale + nonPwdFemale), 0);
  const nonPwdOther = Math.max(Number(nonPwd.other ?? nonPwdTotal - nonPwdMale - nonPwdFemale), 0);

  const normalizedPwd = {
    male: pwdMale,
    female: pwdFemale,
    other: pwdOther,
    total: pwdTotal,
  };

  const normalizedNonPwd = {
    male: nonPwdMale,
    female: nonPwdFemale,
    other: nonPwdOther,
    total: nonPwdTotal,
  };

  return {
    pwd: normalizedPwd,
    nonPwd: normalizedNonPwd,
  };
};

export default function AdminStatistics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedBatch, setSelectedBatch] = useState(currentYear.toString());
  const [batches, setBatches] = useState([{ year: currentYear.toString() }]);
  const [pendingBatchRequests, setPendingBatchRequests] = useState(0);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genderStats, setGenderStats] = useState([]);
  const [genderLoading, setGenderLoading] = useState(true);
  const [genderError, setGenderError] = useState("");
  const [stateStats, setStateStats] = useState([]);
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState("");
  const [categoryStats, setCategoryStats] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [rankRangeStats, setRankRangeStats] = useState([]);
  const [rankRangeLoading, setRankRangeLoading] = useState(true);
  const [rankRangeError, setRankRangeError] = useState("");
  const [rankBranchFilter, setRankBranchFilter] = useState("ALL");
  const [pwdStats, setPwdStats] = useState({
    pwd: { male: 0, female: 0, total: 0 },
    nonPwd: { male: 0, female: 0, total: 0 },
  });
  const [pwdLoading, setPwdLoading] = useState(true);
  const [pwdError, setPwdError] = useState("");
  const isBatchSwitching = pendingBatchRequests > 0;

  const beginBatchRequest = () => {
    setPendingBatchRequests((count) => count + 1);
  };

  const endBatchRequest = () => {
    setPendingBatchRequests((count) => Math.max(count - 1, 0));
  };

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

    const loadBatches = async () => {
      try {
        const response = await API.get("/admin/batches");
        const payload = response?.data;

        const rawRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.batches)
              ? payload.data.batches
              : Array.isArray(payload?.batches)
                ? payload.batches
                : [];

        if (cancelled) return;

        const normalizedYears = Array.from(
          new Set(
            rawRows
              .map((row) => String(row?.year || row?.startYear || row?.code || "").trim())
              .filter(Boolean)
          )
        )
          .sort((left, right) => Number(right) - Number(left))
          .map((year) => ({ year }));

        if (normalizedYears.length > 0) {
          setBatches(normalizedYears);

          const hasCurrentSelection = normalizedYears.some(
            (batch) => batch.year === selectedBatch
          );
          if (!hasCurrentSelection) {
            setSelectedBatch(normalizedYears[0].year);
          }
        } else {
          setBatches([{ year: selectedBatch }]);
        }
      } catch {
        if (!cancelled) {
          setBatches([{ year: selectedBatch }]);
        }
      }
    };

    loadBatches();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/branch", {
          params: { batch: selectedBatch },
        });
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
        endBatchRequest();
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadCategoryStats = async () => {
      try {
        setCategoryLoading(true);
        setCategoryError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/category", {
          params: { batch: selectedBatch },
        });
        const rows = parseStatsRows(response?.data);

        if (cancelled) return;

        const normalized = rows
          .map((row) => {
            const male = Math.max(Number(row?.male || 0), 0);
            const female = Math.max(Number(row?.female || 0), 0);
            const totalRaw = Number(row?.total);
            const totalBase = Number.isFinite(totalRaw)
              ? Math.max(totalRaw, male + female)
              : male + female;
            const otherFromApi = Number(row?.other);
            const other = Number.isFinite(otherFromApi)
              ? Math.max(otherFromApi, 0)
              : Math.max(totalBase - male - female, 0);
            const total = Math.max(totalBase, male + female + other);
            const category = String(row?.category || "-").trim() || "-";

            return {
              category,
              categoryLabel: formatCategoryLabel(category),
              male,
              female,
              other,
              total,
            };
          })
          .sort((left, right) => right.total - left.total);

        setCategoryStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setCategoryError(err.response?.data?.message || "Failed to load category statistics");
          setCategoryStats([]);
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
        endBatchRequest();
      }
    };

    loadCategoryStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadRankRangeStats = async () => {
      try {
        setRankRangeLoading(true);
        setRankRangeError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/rank-range", {
          params: { batch: selectedBatch },
        });
        const rows = parseStatsRows(response?.data);

        if (cancelled) return;

        const normalizedRows = rows
          .map((row) => {
            const branch = String(row?.branch || "-")
              .trim()
              .toUpperCase();
            const categoryRaw = String(row?.category || "-")
              .trim()
              .toUpperCase();
            const isPwdFromFlag =
              row?.isPwd === true ||
              String(row?.isPwd || "").toLowerCase() === "true" ||
              Number(row?.isPwd) === 1;
            const isPwdFromCategory = categoryRaw === "PWD";
            const category = isPwdFromFlag || isPwdFromCategory ? "PWD" : categoryRaw;
            const openingRank = Math.max(Number(row?.openingRank || 0), 0);
            const closingRank = Math.max(Number(row?.closingRank || 0), 0);

            if (!Number.isFinite(openingRank) || !Number.isFinite(closingRank)) {
              return null;
            }

            return {
              branch,
              category,
              openingRank,
              closingRank,
            };
          })
          .filter(Boolean);

        const mergedByBranchAndCategory = normalizedRows.reduce((accumulator, row) => {
          const key = `${row.branch}-${row.category}`;
          const existing = accumulator.get(key);

          if (!existing) {
            accumulator.set(key, {
              key,
              branch: row.branch,
              category: row.category,
              categoryLabel: formatCategoryLabel(row.category),
              label: `${row.branch} (${formatCategoryLabel(row.category)})`,
              color: getCategoryColor(row.category),
              openingRank: row.openingRank,
              closingRank: row.closingRank,
            });
            return accumulator;
          }

          existing.openingRank = Math.min(existing.openingRank, row.openingRank);
          existing.closingRank = Math.max(existing.closingRank, row.closingRank);
          return accumulator;
        }, new Map());

        const normalized = Array.from(mergedByBranchAndCategory.values())
          .sort((left, right) => left.openingRank - right.openingRank);

        setRankRangeStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setRankRangeError(err.response?.data?.message || "Failed to load rank range statistics");
          setRankRangeStats([]);
        }
      } finally {
        if (!cancelled) {
          setRankRangeLoading(false);
        }
        endBatchRequest();
      }
    };

    loadRankRangeStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadPwdStats = async () => {
      try {
        setPwdLoading(true);
        setPwdError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/pwd", {
          params: { batch: selectedBatch },
        });
        const normalized = parsePwdStats(response?.data);

        if (cancelled) return;

        setPwdStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setPwdError(err.response?.data?.message || "Failed to load PWD distribution");
          setPwdStats({
            pwd: { male: 0, female: 0, other: 0, total: 0 },
            nonPwd: { male: 0, female: 0, other: 0, total: 0 },
          });
        }
      } finally {
        if (!cancelled) {
          setPwdLoading(false);
        }
        endBatchRequest();
      }
    };

    loadPwdStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadStateStats = async () => {
      try {
        setStateLoading(true);
        setStateError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/state", {
          params: { batch: selectedBatch },
        });
        const rows = parseStatsRows(response?.data);

        if (cancelled) return;

        const normalized = rows
          .map((row) => {
            const male = Math.max(Number(row?.male || 0), 0);
            const female = Math.max(Number(row?.female || 0), 0);
            const total = Math.max(Number(row?.total || male + female), 0);
            const otherFromApi = Number(row?.other);
            const other = Number.isFinite(otherFromApi)
              ? Math.max(otherFromApi, 0)
              : Math.max(total - male - female, 0);

            return {
              state: String(row?.state || "-").trim() || "-",
              male,
              female,
              other,
              total,
            };
          })
          .sort((left, right) => right.total - left.total);

        setStateStats(normalized);
      } catch (err) {
        if (!cancelled) {
          setStateError(err.response?.data?.message || "Failed to load state statistics");
          setStateStats([]);
        }
      } finally {
        if (!cancelled) {
          setStateLoading(false);
        }
        endBatchRequest();
      }
    };

    loadStateStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  useEffect(() => {
    let cancelled = false;

    const loadGenderStats = async () => {
      try {
        setGenderLoading(true);
        setGenderError("");
        beginBatchRequest();

        const response = await API.get("/admin/stats/gender", {
          params: { batch: selectedBatch },
        });
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
        endBatchRequest();
      }
    };

    loadGenderStats();

    return () => {
      cancelled = true;
    };
  }, [selectedBatch]);

  const chartData = useMemo(() => stats, [stats]);
  const genderChartData = useMemo(() => genderStats, [genderStats]);
  const stateChartHeight = useMemo(
    () => Math.max(320, stateStats.length * 36),
    [stateStats.length]
  );
  const categoryChartData = useMemo(() => categoryStats, [categoryStats]);
  const categoryChartHeight = useMemo(
    () => Math.max(300, categoryStats.length * 42),
    [categoryStats.length]
  );
  const rankBranchOptions = useMemo(() => {
    const unique = Array.from(new Set(rankRangeStats.map((row) => row.branch)));
    return ["ALL", ...unique.sort((left, right) => left.localeCompare(right))];
  }, [rankRangeStats]);
  const filteredRankRangeRows = useMemo(() => {
    const filtered =
      rankBranchFilter === "ALL"
        ? rankRangeStats
        : rankRangeStats.filter((row) => row.branch === rankBranchFilter);

    return filtered.map((row, index) => ({
      ...row,
      index,
    }));
  }, [rankBranchFilter, rankRangeStats]);
  const rankRangeChartHeight = useMemo(
    () => Math.max(260, filteredRankRangeRows.length * 44),
    [filteredRankRangeRows.length]
  );
  const rankDomain = useMemo(() => {
    if (filteredRankRangeRows.length === 0) return [0, 1000];

    const allRanks = filteredRankRangeRows.flatMap((row) => [row.openingRank, row.closingRank]);
    const minRank = Math.min(...allRanks);
    const maxRank = Math.max(...allRanks);
    const padding = Math.max(100, Math.round((maxRank - minRank) * 0.05));

    return [Math.max(minRank - padding, 0), maxRank + padding];
  }, [filteredRankRangeRows]);

  const pwdSummary = useMemo(() => {
    const pwd = pwdStats?.pwd || { male: 0, female: 0, total: 0 };
    const nonPwd = pwdStats?.nonPwd || { male: 0, female: 0, total: 0 };

    const totalStudents = Math.max(Number(pwd.total || 0) + Number(nonPwd.total || 0), 0);
    const pwdPercent = totalStudents > 0 ? (Number(pwd.total || 0) / totalStudents) * 100 : 0;
    const nonPwdPercent = 100 - pwdPercent;

    return {
      pwd,
      nonPwd,
      totalStudents,
      pwdPercent,
      nonPwdPercent,
      pwdPercentLabel: `${Math.round(pwdPercent)}%`,
      nonPwdPercentLabel: `${Math.round(nonPwdPercent)}%`,
    };
  }, [pwdStats]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">Admin Statistics</h1>
            <p className="text-sm text-app-muted mt-1">Branch-wise admission capacity overview</p>
            <p className="text-xs text-app-muted mt-1">Viewing Batch {selectedBatch}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="batch-selector" className="text-xs font-medium text-app-muted">
                Batch
              </label>
              <select
                id="batch-selector"
                value={selectedBatch}
                onChange={(event) => setSelectedBatch(event.target.value)}
                disabled={isBatchSwitching}
                className="h-9 w-40 rounded-md border border-app-border bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
              >
                {batches.map((batch) => (
                  <option key={batch.year} value={batch.year}>
                    {batch.year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-md px-4 py-2 text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>

        {isBatchSwitching && (
          <div className="text-xs text-app-muted -mt-3">Updating statistics for batch {selectedBatch}...</div>
        )}

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

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-app-primary">State-wise Distribution</h2>
          </div>

          {stateLoading && <p className="text-sm text-app-muted">Loading state statistics...</p>}
          {!stateLoading && stateError && <p className="text-sm text-red-600">{stateError}</p>}
          {!stateLoading && !stateError && stateStats.length === 0 && (
            <p className="text-sm text-app-muted">No state statistics available.</p>
          )}

          {!stateLoading && !stateError && stateStats.length > 0 && (
            <div className="overflow-y-auto max-h-[400px] w-full min-w-0">
              <div style={{ height: `${stateChartHeight}px`, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    layout="vertical"
                    data={stateStats}
                    margin={{ top: 8, right: 40, left: 16, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="state"
                      width={130}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: "#f9fafb" }} content={<StateTooltip />} />
                    <Legend verticalAlign="top" align="center" height={24} />
                    <Bar dataKey="male" stackId="a" name="Male" fill="#3b82f6" />
                    <Bar dataKey="female" stackId="a" name="Female" fill="#ec4899" />
                    <Bar dataKey="other" stackId="a" name="Other" fill="#9ca3af">
                      <LabelList dataKey="total" position="right" fill="#374151" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-app-primary">Category-wise Distribution</h2>
          </div>

          {categoryLoading && <p className="text-sm text-app-muted">Loading category statistics...</p>}
          {!categoryLoading && categoryError && <p className="text-sm text-red-600">{categoryError}</p>}
          {!categoryLoading && !categoryError && categoryChartData.length === 0 && (
            <p className="text-sm text-app-muted">No category statistics available.</p>
          )}

          {!categoryLoading && !categoryError && categoryChartData.length > 0 && (
            <div className="overflow-y-auto max-h-[400px] w-full min-w-0">
              <div style={{ height: `${categoryChartHeight}px`, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    layout="vertical"
                    data={categoryChartData}
                    margin={{ top: 8, right: 40, left: 16, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="categoryLabel"
                      width={130}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: "#f9fafb" }} content={<CategoryTooltip />} />
                    <Legend verticalAlign="top" align="center" height={24} />
                    <Bar dataKey="male" stackId="a" name="Male" fill="#3b82f6" />
                    <Bar dataKey="female" stackId="a" name="Female" fill="#ec4899" />
                    <Bar dataKey="other" stackId="a" name="Other" fill="#9ca3af">
                      <LabelList dataKey="total" position="right" fill="#374151" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-app-primary">Opening & Closing Rank by Branch</h2>

            <div className="flex items-center gap-2">
              <label htmlFor="rank-branch-filter" className="text-xs font-medium text-app-muted">
                Branch
              </label>
              <select
                id="rank-branch-filter"
                value={rankBranchFilter}
                onChange={(event) => setRankBranchFilter(event.target.value)}
                className="h-8 rounded-md border border-app-border bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {rankBranchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch === "ALL" ? "All Branches" : branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rankRangeLoading && <p className="text-sm text-app-muted">Loading rank range statistics...</p>}
          {!rankRangeLoading && rankRangeError && <p className="text-sm text-red-600">{rankRangeError}</p>}
          {!rankRangeLoading && !rankRangeError && filteredRankRangeRows.length === 0 && (
            <p className="text-sm text-app-muted">No rank range statistics available.</p>
          )}

          {!rankRangeLoading && !rankRangeError && filteredRankRangeRows.length > 0 && (
            <div className="overflow-y-auto max-h-[400px] w-full min-w-0">
              <div style={{ height: `${rankRangeChartHeight}px`, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ScatterChart margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                    <CartesianGrid horizontal={false} stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={rankDomain}
                      reversed
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value) => Number(value).toLocaleString()}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      ticks={filteredRankRangeRows.map((row) => row.index)}
                      domain={[-0.5, Math.max(filteredRankRangeRows.length - 0.5, 0)]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                      width={180}
                      tickFormatter={(value) => filteredRankRangeRows[value]?.label || ""}
                    />
                    <Tooltip cursor={{ stroke: "#d1d5db", strokeWidth: 1 }} content={<RankRangeTooltip />} />

                    {filteredRankRangeRows.map((row) => (
                      <Scatter
                        key={`rank-range-${row.key}`}
                        data={[
                          {
                            x: row.openingRank,
                            y: row.index,
                            branch: row.branch,
                            category: row.category,
                            categoryLabel: row.categoryLabel,
                            openingRank: row.openingRank,
                            closingRank: row.closingRank,
                          },
                          {
                            x: row.closingRank,
                            y: row.index,
                            branch: row.branch,
                            category: row.category,
                            categoryLabel: row.categoryLabel,
                            openingRank: row.openingRank,
                            closingRank: row.closingRank,
                          },
                        ]}
                        fill={row.color}
                        line={{ stroke: row.color, strokeWidth: 2 }}
                        shape="circle"
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-app-primary">PWD Distribution</h2>
            </div>

            {pwdLoading && <p className="text-sm text-app-muted">Loading PWD distribution...</p>}
            {!pwdLoading && pwdError && <p className="text-sm text-red-600">{pwdError}</p>}

            {!pwdLoading && !pwdError && (
              <div className="space-y-5">
                <div className="w-full h-8 rounded-full overflow-hidden flex bg-gray-100 border border-gray-200">
                  <div
                    className="h-full bg-blue-600 text-white text-xs font-medium flex items-center px-3 whitespace-nowrap overflow-hidden"
                    style={{ width: `${pwdSummary.pwdPercent}%` }}
                    title={`PWD: Male ${pwdSummary.pwd.male}, Female ${pwdSummary.pwd.female}, Total ${pwdSummary.pwd.total}`}
                  >
                    PWD ({pwdSummary.pwd.total}) · {pwdSummary.pwdPercentLabel}
                  </div>
                  <div
                    className="h-full bg-gray-300 text-gray-700 text-xs font-medium flex items-center justify-end px-3 whitespace-nowrap overflow-hidden"
                    style={{ width: `${pwdSummary.nonPwdPercent}%` }}
                    title={`Non-PWD: Male ${pwdSummary.nonPwd.male}, Female ${pwdSummary.nonPwd.female}, Total ${pwdSummary.nonPwd.total}`}
                  >
                    Non-PWD ({pwdSummary.nonPwd.total}) · {pwdSummary.nonPwdPercentLabel}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">PWD</span>
                      <span className="text-gray-600">Male: {pwdSummary.pwd.male} · Female: {pwdSummary.pwd.female} · Other: {pwdSummary.pwd.other || 0}</span>
                    </div>
                    <div
                      className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100"
                      title={`PWD\nMale: ${pwdSummary.pwd.male}\nFemale: ${pwdSummary.pwd.female}\nOther: ${pwdSummary.pwd.other || 0}`}
                    >
                      <div
                        className="h-full bg-[#3b82f6]"
                        style={{
                          width: `${pwdSummary.pwd.total > 0 ? (pwdSummary.pwd.male / pwdSummary.pwd.total) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#ec4899]"
                        style={{
                          width: `${pwdSummary.pwd.total > 0 ? (pwdSummary.pwd.female / pwdSummary.pwd.total) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#9ca3af]"
                        style={{
                          width: `${pwdSummary.pwd.total > 0 ? ((pwdSummary.pwd.other || 0) / pwdSummary.pwd.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">Non-PWD</span>
                      <span className="text-gray-600">Male: {pwdSummary.nonPwd.male} · Female: {pwdSummary.nonPwd.female} · Other: {pwdSummary.nonPwd.other || 0}</span>
                    </div>
                    <div
                      className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100"
                      title={`Non-PWD\nMale: ${pwdSummary.nonPwd.male}\nFemale: ${pwdSummary.nonPwd.female}\nOther: ${pwdSummary.nonPwd.other || 0}`}
                    >
                      <div
                        className="h-full bg-[#3b82f6]"
                        style={{
                          width: `${pwdSummary.nonPwd.total > 0 ? (pwdSummary.nonPwd.male / pwdSummary.nonPwd.total) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#ec4899]"
                        style={{
                          width: `${pwdSummary.nonPwd.total > 0 ? (pwdSummary.nonPwd.female / pwdSummary.nonPwd.total) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#9ca3af]"
                        style={{
                          width: `${pwdSummary.nonPwd.total > 0 ? ((pwdSummary.nonPwd.other || 0) / pwdSummary.nonPwd.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
