
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  ShieldCheck,
  CalendarDays,
  UserRound,
  Mail,
  Filter,
  ListTodo,
  AlertCircle,
  CircleCheck,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-50 text-red-700 border-red-100";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "low":
      return "bg-green-50 text-green-700 border-green-100";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/tasks", {
        params: { search, status },
      });

      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 400);

    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(taskId);

      await api.delete(`/admin/tasks/${taskId}`);

      setTasks((previous) =>
        previous.filter((task) => task._id !== taskId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete task."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

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
                Tasks Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Monitor and manage study tasks created by students.
              </p>
            </div>

            <button
              onClick={fetchTasks}
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
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 p-6 text-white shadow-lg sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <ListTodo size={15} />
                TASK CONTROL CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Manage Student Tasks
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                Keep track of pending and completed tasks,
                monitor deadlines and maintain student productivity.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <ListTodo size={22} />
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  OVERVIEW
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Tasks
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {tasks.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Clock size={22} />
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  IN PROGRESS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Pending Tasks
              </p>

              <h3 className="mt-1 text-3xl font-bold text-amber-600">
                {pendingCount}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <CheckCircle size={22} />
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  FINISHED
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Completed Tasks
              </p>

              <h3 className="mt-1 text-3xl font-bold text-green-600">
                {completedCount}
              </h3>
            </div>
          </section>

          {/* Completion Progress */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Task Completion Overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Completion rate of currently loaded tasks
                </p>
              </div>

              <span className="text-2xl font-bold text-indigo-600">
                {completionRate}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </section>

          {/* Filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Filter size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Search & Filter Tasks
                </h2>

                <p className="text-xs text-slate-500">
                  Search by task title or filter by status.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  type="text"
                  placeholder="Search task title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
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
                onClick={fetchTasks}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Tasks Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  All Student Tasks
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review task details, priorities and deadlines.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {tasks.length} Tasks
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading tasks...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <ListTodo size={32} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No tasks found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">Task</th>
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Due Date</th>
                      <th className="px-5 py-4 font-semibold">Priority</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => {
                      const isCompleted = task.status === "Completed";
                      const isDeleting = deletingId === task._id;

                      return (
                        <tr
                          key={task._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* Task */}
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <ListTodo size={20} />
                              </div>

                              <div className="max-w-[230px]">
                                <p className="break-words font-semibold text-slate-800">
                                  {task.title || "Untitled Task"}
                                </p>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {task.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Student */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <UserRound size={17} />
                              </div>

                              <div className="max-w-[170px]">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {task.user?.name || "Unknown"}
                                </p>

                                <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                                  <Mail size={12} />
                                  {task.user?.email || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />
                              {formatDate(task.dueDate)}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getPriorityStyle(task.priority)}`}>
                              {task.priority || "Normal"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                isCompleted
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isCompleted ? (
                                <CircleCheck size={14} />
                              ) : (
                                <AlertCircle size={14} />
                              )}

                              {task.status || "Pending"}
                            </span>
                          </td>

                          {/* Delete */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => deleteTask(task._id)}
                              disabled={isDeleting}
                              title="Delete task"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
            <p>StudySpace Tasks Management</p>
            <p>Admin Productivity Control Center</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
