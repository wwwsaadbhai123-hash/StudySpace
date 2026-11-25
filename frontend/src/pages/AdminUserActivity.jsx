
import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  UsersRound,
  RefreshCw,
  Search,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  Activity,
  UserRound,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

export default function AdminUserActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/user-activity");
      setActivity(response.data.activity || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load student activity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const filteredActivity = activity.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(value) ||
      student.email?.toLowerCase().includes(value)
    );
  });

  const totalNotes = activity.reduce(
    (sum, student) => sum + (Number(student.totalNotes) || 0),
    0
  );

  const totalCompleted = activity.reduce(
    (sum, student) => sum + (Number(student.completedTasks) || 0),
    0
  );

  const totalGroups = activity.reduce(
    (sum, student) => sum + (Number(student.joinedGroups) || 0),
    0
  );

  const totalTasks = activity.reduce(
    (sum, student) => sum + (Number(student.totalTasks) || 0),
    0
  );

  const stats = [
    {
      label: "Total Students",
      value: activity.length,
      icon: Users,
      color: "blue",
      description: "Registered students",
    },
    {
      label: "Total Notes",
      value: totalNotes,
      icon: FileText,
      color: "violet",
      description: "Notes created",
    },
    {
      label: "Completed Tasks",
      value: totalCompleted,
      icon: CheckCircle,
      color: "emerald",
      description: "Tasks completed",
    },
    {
      label: "Group Memberships",
      value: totalGroups,
      icon: UsersRound,
      color: "orange",
      description: "Total memberships",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-7">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
              <Activity size={17} />
              ADMINISTRATION / USER ACTIVITY
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Student Activity
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Monitor student engagement and activity across StudySpace.
            </p>
          </div>

          <button
            onClick={fetchActivity}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Activity
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>

            <button
              onClick={fetchActivity}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Overview Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <TrendingUp size={14} />
                STUDENT INSIGHTS
              </span>

              <h2 className="mt-4 text-xl sm:text-2xl font-bold">
                Track learning progress
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                Get an overview of student notes, task completion and
                participation in study groups.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 sm:min-w-52">
              <div className="rounded-xl bg-white/15 p-3">
                <Users size={25} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Total Students</p>
                <p className="text-2xl font-bold">
                  {activity.length}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-xl p-3 ${colorStyles[stat.color]}`}>
                    <Icon size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
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

        {/* Task Summary */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ClipboardList size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Task Completion Overview
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Combined task activity of all students
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle size={17} />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {totalCompleted}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock size={17} />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-700">
                  {Math.max(0, totalTasks - totalCompleted)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-medium">
                <span className="text-slate-500">Overall completion</span>
                <span className="text-slate-800">
                  {totalTasks
                    ? Math.round((totalCompleted / totalTasks) * 100)
                    : 0}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${
                      totalTasks
                        ? Math.min(100, (totalCompleted / totalTasks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-5 text-white shadow-lg shadow-blue-600/10">
            <div>
              <div className="inline-flex rounded-xl bg-white/15 p-3">
                <UsersRound size={23} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Study Group Participation
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Total group memberships across all students.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-bold">{totalGroups}</p>
              <p className="mt-1 text-xs text-blue-100">
                Total memberships
              </p>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student Activity Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Individual student performance and participation
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw size={28} className="animate-spin text-blue-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading student activity...
              </p>
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <UserRound size={30} className="text-slate-400" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                No student activity found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try searching with a different name or email."
                  : "Student activity will appear here when available."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-4 py-4 font-semibold">Notes</th>
                      <th className="px-4 py-4 font-semibold">Total Tasks</th>
                      <th className="px-4 py-4 font-semibold">Completed</th>
                      <th className="px-4 py-4 font-semibold">Pending</th>
                      <th className="px-4 py-4 font-semibold">Joined Groups</th>
                      <th className="px-4 py-4 font-semibold">Created Groups</th>
                      <th className="px-4 py-4 font-semibold">Joined Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredActivity.map((student) => (
                      <tr
                        key={student._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                              {student.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {student.name || "Unknown"}
                              </p>
                              <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-700">
                          {student.totalNotes ?? 0}
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-700">
                          {student.totalTasks ?? 0}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700">
                            {student.completedTasks ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-orange-50 px-2.5 py-1.5 font-semibold text-orange-700">
                            {student.pendingTasks ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-700">
                          {student.joinedGroups ?? 0}
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-700">
                          {student.createdGroups ?? 0}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                          {formatDate(student.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {filteredActivity.map((student) => (
                  <div
                    key={student._id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {student.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {student.name || "Unknown"}
                        </h3>
                        <p className="truncate text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-violet-50 p-3">
                        <p className="text-xs text-violet-600">Notes</p>
                        <p className="mt-1 text-lg font-bold text-violet-700">
                          {student.totalNotes ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-xs text-blue-600">Total Tasks</p>
                        <p className="mt-1 text-lg font-bold text-blue-700">
                          {student.totalTasks ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs text-emerald-600">Completed</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">
                          {student.completedTasks ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-3">
                        <p className="text-xs text-orange-600">Pending</p>
                        <p className="mt-1 text-lg font-bold text-orange-700">
                          {student.pendingTasks ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Joined Groups</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">
                          {student.joinedGroups ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Created Groups</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">
                          {student.createdGroups ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-500">Joined Date</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(student.createdAt)}
                      </span>
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
                {filteredActivity.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800">
                {activity.length}
              </strong>{" "}
              students
            </span>

            <span>StudySpace Admin Panel</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
