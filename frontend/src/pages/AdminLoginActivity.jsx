
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

import {
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Clock,
  Globe,
  AlertCircle,
  LockKeyhole,
  UserRound,
  Monitor,
  TrendingUp,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return parsed.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBrowser(userAgent = "") {
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("OPR/")) return "Opera";
  if (userAgent.includes("Chrome/")) return "Google Chrome";
  if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
  if (userAgent.includes("Safari/")) return "Safari";

  return "Unknown Browser";
}

export default function AdminLoginActivity() {
  const [activities, setActivities] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    successfulLogins: 0,
    failedLogins: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/login-activities", {
        params: {
          search,
          status,
        },
      });

      setActivities(response.data.activities || []);

      setStats({
        total: response.data.total || 0,
        successfulLogins: response.data.successfulLogins || 0,
        failedLogins: response.data.failedLogins || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load login activities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const successRate =
    stats.total > 0
      ? Math.round((stats.successfulLogins / stats.total) * 100)
      : 0;

  const statCards = [
    {
      title: "Total Login Attempts",
      value: stats.total,
      description: "All recorded attempts",
      icon: Activity,
      color: "blue",
    },
    {
      title: "Successful Logins",
      value: stats.successfulLogins,
      description: "Authorized access",
      icon: CheckCircle,
      color: "emerald",
    },
    {
      title: "Failed Logins",
      value: stats.failedLogins,
      description: "Unsuccessful attempts",
      icon: XCircle,
      color: "red",
    },
  ];

  const iconStyles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <AppLayout>
      <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <ShieldCheck size={17} />
              ADMINISTRATION / SECURITY
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Security & Login Activity
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor successful and failed login attempts across StudySpace.
            </p>
          </div>

          <button
            onClick={fetchActivities}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <LockKeyhole size={14} />
                SECURITY MONITORING
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Keep your platform secure
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review login history, monitor failed authentication attempts
                and inspect browser and IP information.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <ShieldCheck size={34} />
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${iconStyles[card.color]}`}>
                    <Icon size={23} />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    OVERVIEW
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold text-slate-900">
                  {card.value.toLocaleString()}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {card.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <TrendingUp size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Login Success Rate
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Successful attempts compared to all recorded attempts
                </p>
              </div>
            </div>

            <span className="text-2xl font-bold text-emerald-600">
              {successRate}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">
              Search & Filter Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Find login records using email, IP address or login status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email or IP address..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="">All Login Attempts</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {(search || status) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Login History */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Login History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest 100 matching login records.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {activities.length} Records
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw size={28} className="animate-spin text-blue-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading login activities...
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <Activity size={32} className="text-slate-400" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No login activities found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Login attempts will appear here when available.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">User</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 font-semibold">IP Address</th>
                      <th className="px-4 py-4 font-semibold">Browser</th>
                      <th className="px-4 py-4 font-semibold">Failure Reason</th>
                      <th className="px-4 py-4 font-semibold">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {activities.map((item) => (
                      <tr
                        key={item._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <UserRound size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {item.user?.name || "Unknown User"}
                              </p>
                              <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {item.status === "success" ? (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle size={13} />
                              Successful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700">
                              <XCircle size={13} />
                              Failed
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Globe size={15} className="text-slate-400" />
                            {item.ipAddress || "Unknown"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Monitor size={15} className="text-slate-400" />
                            {getBrowser(item.userAgent)}
                          </span>
                        </td>

                        <td className="max-w-48 px-4 py-4 text-slate-500">
                          <p className="break-words">
                            {item.failureReason || "—"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Clock size={14} />
                            {formatDate(item.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {activities.map((item) => (
                  <div
                    key={item._id}
                    className="min-w-0 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <UserRound size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {item.user?.name || "Unknown User"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.email}
                          </p>
                        </div>
                      </div>

                      {item.status === "success" ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          Successful
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                          Failed
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Globe size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="break-all">
                          {item.ipAddress || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Monitor size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>{getBrowser(item.userAgent)}</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Clock size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>

                      {item.failureReason && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
                          <strong>Failure Reason:</strong>
                          <p className="mt-1 break-words">
                            {item.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing{" "}
              <strong className="text-slate-800">
                {activities.length}
              </strong>{" "}
              login records
            </span>

            <span>StudySpace Security Center</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
