
import { useCallback, useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  RefreshCw,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Bug,
  Lightbulb,
  MessageCircle,
  CalendarDays,
  UserRound,
  Filter,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const statuses = [
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const typeIcons = {
  Feedback: MessageCircle,
  "Bug Report": Bug,
  "Feature Request": Lightbulb,
  Other: MessageSquare,
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/feedback", {
        params: { search, status, type },
      });

      setFeedback(response.data.feedback || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load feedback."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, type]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      setUpdatingId(feedbackId);

      await api.put(`/admin/feedback/${feedbackId}/status`, {
        status: newStatus,
      });

      await fetchFeedback();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (feedbackId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(feedbackId);

      await api.delete(`/admin/feedback/${feedbackId}`);

      setFeedback((previous) =>
        previous.filter((item) => item._id !== feedbackId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete feedback."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = feedback.filter(
    (item) => item.status === "Pending"
  ).length;

  const progressCount = feedback.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedCount = feedback.filter(
    (item) => item.status === "Resolved"
  ).length;

  const statCards = [
    {
      title: "Total Feedback",
      value: feedback.length,
      icon: MessageSquare,
      iconStyle: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: progressCount,
      icon: AlertCircle,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <ShieldCheck size={17} />
                ADMINISTRATION
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Feedback Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Review and manage feedback submitted by students.
              </p>
            </div>

            <button
              onClick={fetchFeedback}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-lg sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <MessageSquare size={15} />
                SUPPORT CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Listen to Your Community
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Track student feedback, handle bug reports
                and manage feature requests from one place.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-3 ${item.iconStyle}`}>
                      <Icon size={22} />
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Overview
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h3>
                </div>
              );
            })}
          </section>

          {/* Filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Filter size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Search & Filters
                </h2>
                <p className="text-xs text-slate-500">
                  Find feedback by keyword, status or type.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject or message..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">All Statuses</option>
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">All Types</option>
                <option value="Feedback">Feedback</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                onClick={fetchFeedback}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Feedback List */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Student Submissions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review and update feedback status.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {feedback.length} Submissions
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading feedback...
                </p>
              </div>
            ) : feedback.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <MessageSquare size={30} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No feedback found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {feedback.map((item) => {
                  const TypeIcon =
                    typeIcons[item.type] || MessageSquare;

                  const isUpdating = updatingId === item._id;
                  const isDeleting = deletingId === item._id;

                  return (
                    <article
                      key={item._id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">

                          {/* Badges */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              <TypeIcon size={13} />
                              {item.type || "Other"}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusColors[item.status] ||
                                "border-slate-200 bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.status || "Pending"}
                            </span>
                          </div>

                          {/* Content */}
                          <h3 className="break-words text-lg font-bold text-slate-900">
                            {item.subject || "Untitled Feedback"}
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                            {item.message || "No message provided."}
                          </p>

                          {/* User Info */}
                          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <UserRound size={14} />
                              {item.user?.name || "Unknown User"}
                            </span>

                            {item.user?.email && (
                              <span className="break-all">
                                {item.user.email}
                              </span>
                            )}

                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row flex-wrap items-center gap-2 xl:w-48 xl:flex-col xl:items-stretch">
                          <label className="w-full text-xs font-semibold text-slate-500">
                            Update Status
                          </label>

                          <select
                            value={item.status || "Pending"}
                            disabled={isUpdating || isDeleting}
                            onChange={(e) =>
                              handleStatusChange(
                                item._id,
                                e.target.value
                              )
                            }
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 xl:w-full"
                          >
                            {statuses.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <span className="flex items-center gap-1 text-xs text-indigo-600">
                              <RefreshCw size={13} className="animate-spin" />
                              Updating...
                            </span>
                          )}

                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting || isUpdating}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 xl:w-full"
                          >
                            {isDeleting ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
            <p>StudySpace Feedback Management</p>
            <p>Admin Support Center</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
