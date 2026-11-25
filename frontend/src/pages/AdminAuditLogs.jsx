
import { useEffect, useState } from "react";

import {
  ClipboardList,
  RefreshCw,
  Search,
  Clock,
  User,
  ShieldCheck,
  FileText,
  Globe,
  Filter,
  AlertCircle,
  Activity,
  CalendarDays,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const categoryColors = {
  user: "bg-blue-50 text-blue-700 border-blue-100",
  content: "bg-purple-50 text-purple-700 border-purple-100",
  settings: "bg-amber-50 text-amber-700 border-amber-100",
  notification: "bg-emerald-50 text-emerald-700 border-emerald-100",
  security: "bg-red-50 text-red-700 border-red-100",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const categories = [
  { value: "", label: "All Categories" },
  { value: "user", label: "User" },
  { value: "content", label: "Content" },
  { value: "settings", label: "Settings" },
  { value: "notification", label: "Notification" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const formatDate = (date) => {
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
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/audit-logs", {
        params: { search, category },
      });

      setLogs(response.data.logs || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error("Audit Logs Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category]);

  const displayedCategories = new Set(
    logs.map((log) => log.category)
  ).size;

  const securityLogs = logs.filter(
    (log) => log.category === "security"
  ).length;

  return (
    <AppLayout>
      <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">
              <ShieldCheck size={17} />
              ADMINISTRATION / MONITORING
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Admin Audit Logs
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Track and review administrative activities across StudySpace.
            </p>
          </div>

          <button
            onClick={fetchLogs}
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-purple-100">
                <ClipboardList size={14} />
                ACTIVITY MONITORING
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Complete Administrative Activity History
              </h2>

              <p className="mt-2 text-sm leading-6 text-purple-100/80">
                Review administrator actions, activity categories,
                descriptions and recorded IP addresses from one place.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Activity size={34} />
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText size={23} />
              </div>

              <span className="text-[10px] font-bold tracking-wider text-slate-400">
                TOTAL
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-slate-900">
              {total.toLocaleString()}
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Total Audit Logs
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total records reported by server
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <ClipboardList size={23} />
              </div>

              <span className="text-[10px] font-bold tracking-wider text-slate-400">
                CURRENT RESULTS
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-slate-900">
              {logs.length}
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Displayed Records
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Records currently loaded
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <ShieldCheck size={23} />
              </div>

              <span className="text-[10px] font-bold tracking-wider text-slate-400">
                SECURITY
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-slate-900">
              {securityLogs}
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Security Activities
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Security records in current results
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />

            <div>
              <h2 className="font-bold text-slate-900">
                Search & Filter Logs
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Find specific administrative activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search actions or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {(search || category) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Activity History */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Activity History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest administrative activity records.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              {logs.length} Records
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw
                size={28}
                className="animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading audit logs...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <ClipboardList size={32} className="text-slate-400" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No audit logs found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Administrative activity records will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Administrator
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Action
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Category
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Description
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        IP Address
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        Date & Time
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <User size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {log.admin?.name || "Unknown"}
                              </p>

                              <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                                {log.admin?.email || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="max-w-44 break-words font-semibold text-slate-800">
                            {log.action || "Unknown Action"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                              categoryColors[log.category] ||
                              categoryColors.other
                            }`}
                          >
                            {log.category || "other"}
                          </span>
                        </td>

                        <td className="max-w-xs px-4 py-4 text-sm leading-6 text-slate-600">
                          <p className="break-words">
                            {log.description || "—"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Globe size={15} className="text-slate-400" />
                            {log.ipAddress || "Unknown"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Clock size={14} />
                            {formatDate(log.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="min-w-0 rounded-2xl border border-slate-200 p-4 transition hover:border-purple-200 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <User size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-slate-900">
                          {log.admin?.name || "Unknown"}
                        </p>

                        <p className="break-all text-xs text-slate-500">
                          {log.admin?.email || "Unknown"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
                          categoryColors[log.category] ||
                          categoryColors.other
                        }`}
                      >
                        {log.category || "other"}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {log.action || "Unknown Action"}
                      </p>

                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                        {log.description || "No description available."}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <Globe size={15} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="break-all">
                          {log.ipAddress || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <CalendarDays size={15} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
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
                {logs.length}
              </strong>{" "}
              records
            </span>

            <span>StudySpace Audit Center</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
