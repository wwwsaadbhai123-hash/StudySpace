
import { useEffect, useState, useCallback } from "react";
import {
  Monitor,
  RefreshCw,
  Shield,
  LogOut,
  Users,
  Clock,
  Globe,
  Laptop,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString();
};

const getBrowser = (userAgent = "") => {
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("Chrome/")) return "Google Chrome";
  if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Unknown Browser";
};

export default function AdminActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/active-sessions");
      setSessions(response.data.sessions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load active sessions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const terminateSession = async (session) => {
    const confirmed = window.confirm(
      `Are you sure you want to terminate the session of ${
        session.user?.name || "this user"
      }?`
    );

    if (!confirmed) return;

    try {
      setTerminatingId(session.sessionId);
      setError("");

      await api.delete(
        `/admin/active-sessions/${encodeURIComponent(
          session.sessionId
        )}`
      );

      setSessions((previous) =>
        previous.filter(
          (item) => item.sessionId !== session.sessionId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to terminate this session."
      );
    } finally {
      setTerminatingId(null);
    }
  };

  const studentCount = sessions.filter(
    (session) => session.user?.role !== "admin"
  ).length;

  const adminCount = sessions.filter(
    (session) => session.user?.role === "admin"
  ).length;

  return (
    <AppLayout>
      <div className="min-w-0 space-y-7 pb-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-blue-200">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Security Management
                </span>
              </div>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Active Sessions
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Monitor all currently active user sessions and
                manage account security from one place.
              </p>
            </div>

            <button
              onClick={fetchSessions}
              disabled={loading}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Active Sessions
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {sessions.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Monitor size={25} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Currently active connections
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Student Sessions
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {studentCount}
                </h2>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Users size={25} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Active student accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Admin Sessions
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {adminCount}
                </h2>
              </div>

              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Shield size={25} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Active administrator accounts
            </p>
          </div>
        </div>

        {/* Session List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Currently Active Sessions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View devices and terminate suspicious sessions.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              {sessions.length} Sessions
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <RefreshCw
                size={30}
                className="animate-spin text-blue-600"
              />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading active sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-5">
                <Shield size={35} className="text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No Active Sessions
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There are currently no active user sessions to display.
              </p>

              <button
                onClick={fetchSessions}
                className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">IP Address</th>
                      <th className="px-5 py-4">Browser</th>
                      <th className="px-5 py-4">Last Active</th>
                      <th className="px-5 py-4">Expires</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sessions.map((session) => (
                      <tr
                        key={session.sessionId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {session.user?.name || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {session.user?.email || "-"}
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                            {session.user?.role || "student"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {session.ipAddress || "Unknown"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Laptop size={17} className="text-slate-400" />
                            {getBrowser(session.userAgent)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock size={15} className="text-slate-400" />
                            {formatDate(session.lastActiveAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(session.expiresAt)}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => terminateSession(session)}
                            disabled={terminatingId === session.sessionId}
                            className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <LogOut size={15} />
                            {terminatingId === session.sessionId
                              ? "Ending..."
                              : "Terminate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="min-w-0 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600">
                          <Monitor size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-slate-800">
                            {session.user?.name || "Unknown"}
                          </h3>
                          <p className="break-all text-xs text-slate-500">
                            {session.user?.email || "-"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Role</p>
                        <p className="mt-1 break-words text-sm font-medium capitalize text-slate-700">
                          {session.user?.role || "student"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Browser</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                          {getBrowser(session.userAgent)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">IP Address</p>
                        <p className="mt-1 break-all text-sm font-medium text-slate-700">
                          {session.ipAddress || "Unknown"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Last Active</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                          {formatDate(session.lastActiveAt)}
                        </p>
                      </div>

                      <div className="min-w-0 sm:col-span-2">
                        <p className="text-xs text-slate-400">Expires</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                          {formatDate(session.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => terminateSession(session)}
                      disabled={terminatingId === session.sessionId}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {terminatingId === session.sessionId
                        ? "Terminating..."
                        : "Terminate Session"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Globe size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Security Reminder
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              If you notice an unfamiliar device or suspicious
              location, terminate that session to protect the account.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
