
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

import {
  Bell,
  RefreshCw,
  Search,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
  Activity,
  UserRound,
  CalendarDays,
  MessageSquare,
  Filter,
  X,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTypeLabel(value) {
  return (
    value
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "General"
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/notifications", {
        params: { search, type, status },
      });

      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [search, type, status]);

  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await api.delete(`/admin/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage("Notification deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const readCount = notifications.filter(
    (item) => item.isRead
  ).length;

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const stats = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: Bell,
      color: "blue",
      description: "Notifications in current results",
    },
    {
      label: "Read Notifications",
      value: readCount,
      icon: CheckCircle,
      color: "emerald",
      description: "Already read",
    },
    {
      label: "Unread Notifications",
      value: unreadCount,
      icon: Circle,
      color: "orange",
      description: "Awaiting attention",
    },
  ];

  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <AppLayout>
      <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Activity size={17} />
              ADMINISTRATION / NOTIFICATIONS
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Notifications Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View, monitor and manage platform notifications.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <Bell size={14} />
                NOTIFICATION CENTER
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Stay on top of platform activity
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                Monitor notification delivery, review read status and
                manage messages sent across StudySpace.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Bell size={32} />
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={() => setMessage("")}
              className="ml-auto rounded-lg p-1 hover:bg-emerald-100"
              aria-label="Dismiss success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-xl p-3 ${colors[stat.color]}`}>
                    <Icon size={22} />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    OVERVIEW
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-slate-900">
                  {stat.value.toLocaleString()}
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {stat.label}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={19} className="text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900">
                Filter Notifications
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Search and filter notifications by type or status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_180px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search message or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="">All Types</option>
              <option value="group_join">Group Join</option>
              <option value="new_message">New Message</option>
              <option value="note_update">Note Update</option>
              <option value="task_reminder">Task Reminder</option>
              <option value="general">General</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>

          {(search || type || status) && (
            <button
              onClick={() => {
                setSearch("");
                setType("");
                setStatus("");
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Notifications
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review recipients, messages and notification status.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {notifications.length} Results
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw
                size={28}
                className="animate-spin text-blue-600"
              />
              <p className="mt-3 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <Bell size={30} className="text-slate-400" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No notifications found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Try changing your search or filters to find notifications.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Recipient</th>
                      <th className="px-4 py-4 font-semibold">Message</th>
                      <th className="px-4 py-4 font-semibold">Type</th>
                      <th className="px-4 py-4 font-semibold">Sender</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 font-semibold">Date</th>
                      <th className="px-4 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {notifications.map((item) => (
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
                                {item.recipient?.name || "Unknown"}
                              </p>
                              <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                                {item.recipient?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-xs px-4 py-4">
                          <p className="break-words leading-5 text-slate-700">
                            {item.message}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex whitespace-nowrap rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                            {getTypeLabel(item.type)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {item.sender?.name || "System"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                              item.isRead
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {item.isRead ? (
                              <CheckCircle size={13} />
                            ) : (
                              <Circle size={13} />
                            )}
                            {item.isRead ? "Read" : "Unread"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => deleteNotification(item._id)}
                            disabled={deletingId === item._id}
                            title="Delete notification"
                            className="inline-flex items-center justify-center rounded-lg p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === item._id ? (
                              <RefreshCw size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {notifications.map((item) => (
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
                            {item.recipient?.name || "Unknown"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.recipient?.email || "—"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                          item.isRead
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="mt-4 break-words text-sm leading-6 text-slate-700">
                      {item.message}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                        {getTypeLabel(item.type)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Sender: {item.sender?.name || "System"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays size={14} />
                        {formatDate(item.createdAt)}
                      </span>

                      <button
                        onClick={() => deleteNotification(item._id)}
                        disabled={deletingId === item._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === item._id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
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
                {notifications.length}
              </strong>{" "}
              notifications
            </span>

            <span>StudySpace Admin Panel</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
