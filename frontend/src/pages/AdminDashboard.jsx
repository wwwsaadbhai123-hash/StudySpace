
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  ShieldCheck,
  LayoutDashboard,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  Activity,
  Mail,
  Clock3,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const statIcons = [
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
];

const formatLabel = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyle = (status) => {
  const value = String(status || "Pending").toLowerCase();

  if (value === "resolved") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "in progress") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");
      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboard?.stats || {};
  const recentUsers = dashboard?.recentUsers || [];
  const recentFeedback = dashboard?.recentFeedback || [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <ShieldCheck size={17} />
                ADMINISTRATION
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Welcome to StudySpace Administration.
                Manage and monitor your platform.
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                onClick={fetchDashboard}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !dashboard ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 font-medium text-slate-600">
                Loading Admin Dashboard...
              </p>
            </div>
          ) : dashboard && (
            <>
              {/* Welcome Banner */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-lg sm:p-8">
                <div className="relative z-10 max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                    <ShieldCheck size={15} />
                    ADMIN CONTROL CENTER
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Manage StudySpace
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                    Keep track of platform activity, monitor users
                    and review feedback from one place.
                  </p>
                </div>

                <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
                <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
              </section>

              {/* Statistics */}
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                    <LayoutDashboard size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Platform Overview
                    </h2>
                    <p className="text-sm text-slate-500">
                      Important platform statistics
                    </p>
                  </div>
                </div>

                {Object.keys(stats).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(stats).map(([key, value], index) => {
                      const Icon =
                        statIcons[index % statIcons.length];

                      return (
                        <div
                          key={key}
                          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                              <Icon size={22} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Overview
                            </span>
                          </div>

                          <p className="mt-5 text-sm font-medium text-slate-500">
                            {formatLabel(key)}
                          </p>

                          <h3 className="mt-1 break-words text-3xl font-bold text-slate-900">
                            {value ?? 0}
                          </h3>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    No statistics available.
                  </div>
                )}
              </section>

              {/* Recent Users */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                      <Users size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Recent Users
                      </h2>
                      <p className="text-xs text-slate-500">
                        Latest registered members
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {recentUsers.length} Users
                  </span>
                </div>

                {recentUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead className="bg-slate-50">
                        <tr className="text-xs uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-4 font-semibold">Name</th>
                          <th className="px-6 py-4 font-semibold">Email</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Joined</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {recentUsers.map((user) => (
                          <tr
                            key={user._id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <span className="font-semibold text-slate-800">
                                  {user.name || "Unknown"}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500">
                              {user.email || "N/A"}
                            </td>

                            <td className="px-6 py-4">
                              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700">
                                {user.role || "User"}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <CalendarDays size={15} />
                                {formatDate(user.createdAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <Users className="mx-auto text-slate-300" size={35} />
                    <p className="mt-3 font-medium text-slate-600">
                      No users found.
                    </p>
                  </div>
                )}
              </section>

              {/* Recent Feedback */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                      <MessageSquare size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Recent Feedback
                      </h2>
                      <p className="text-xs text-slate-500">
                        Latest user submissions
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {recentFeedback.length} Submissions
                  </span>
                </div>

                {recentFeedback.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentFeedback.map((item) => (
                      <div
                        key={item._id}
                        className="p-5 transition hover:bg-slate-50 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-slate-800">
                              {item.subject || item.type || "Feedback"}
                            </h3>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                              {item.message || "No message provided."}
                            </p>
                          </div>

                          <span
                            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(item.status)}`}
                          >
                            {item.status || "Pending"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} />
                            By: {item.user?.name || "Unknown user"}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Mail size={14} />
                            {item.type || "Feedback"}
                          </span>

                          {item.createdAt && (
                            <span className="flex items-center gap-1.5">
                              <Clock3 size={14} />
                              {formatDate(item.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <MessageSquare className="mx-auto text-slate-300" size={35} />
                    <p className="mt-3 font-medium text-slate-600">
                      No feedback found.
                    </p>
                  </div>
                )}
              </section>

              {/* Footer */}
              <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
                <p>StudySpace Admin Panel</p>
                <p>Platform Management & Administration</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
