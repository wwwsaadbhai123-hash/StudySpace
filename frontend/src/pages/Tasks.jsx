
import { useEffect, useState } from "react";
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  ClipboardList,
  X,
  Clock,
  AlertCircle,
  Bell,
  BellOff,
  Loader2,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const initialForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  reminderEnabled: true,
  reminderTime: "",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [busyTask, setBusyTask] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tasks");
      setTasks(response.data.tasks || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateForm = () => {
    setEditingTask(null);
    setFormData(initialForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      priority: task.priority || "Medium",
      reminderEnabled: task.reminderEnabled ?? true,
      reminderTime: task.reminderTime
        ? new Date(task.reminderTime).toISOString().slice(0, 16)
        : "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingTask(null);
    setFormData(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        reminderTime:
          formData.reminderEnabled && formData.reminderTime
            ? new Date(formData.reminderTime).toISOString()
            : null,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setShowForm(false);
      setEditingTask(null);
      setFormData(initialForm);

      await fetchTasks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      setBusyTask(task._id);
      setError("");

      const newStatus =
        task.status === "Completed" ? "Pending" : "Completed";

      await api.put(`/tasks/${task._id}`, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((item) =>
          item._id === task._id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update task."
      );
    } finally {
      setBusyTask("");
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/tasks/${taskId}`);

      setTasks((prev) =>
        prev.filter((task) => task._id !== taskId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete task."
      );
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "Completed") return false;

    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);

    return due < new Date();
  };

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const overdueTasks = pendingTasks.filter(isOverdue);

  const priorityStyle = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Not set";

  return (
    <AppLayout>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-blue-600">
              <ClipboardList size={21} />
              <span className="text-sm font-semibold tracking-wide">
                TASK MANAGEMENT
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Study Tasks
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Organize your study work and stay on top of deadlines.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={19} />
            Add New Task
          </button>
        </header>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <ClipboardList size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Tasks</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {tasks.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {pendingTasks.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {completedTasks.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Overdue</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {overdueTasks.length}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 break-words">{error}</span>
            <button
              onClick={() => setError("")}
              className="shrink-0"
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add your study task details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Complete HTML assignment"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details about your task..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={
                      editingTask
                        ? undefined
                        : new Date().toLocaleDateString("en-CA")
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Task Reminder
                      </h3>
                      <p className="text-sm text-slate-500">
                        Get notified when it's time for this task.
                      </p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={formData.reminderEnabled}
                      onChange={handleChange}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {formData.reminderEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>

                {formData.reminderEnabled ? (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      <Clock size={16} className="mr-1 inline" />
                      Reminder Date & Time *
                    </label>

                    <input
                      type="datetime-local"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Select when you want to receive the reminder.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <BellOff size={16} />
                    Reminder is turned off for this task.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !formData.title.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {editingTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={30} className="animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <ClipboardList
              size={48}
              className="mx-auto mb-4 text-slate-300"
            />
            <h2 className="text-xl font-bold text-slate-800">
              No tasks yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Create your first study task and start organizing your work.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Create First Task
            </button>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Pending Tasks */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Pending Tasks
                </h2>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  {pendingTasks.length}
                </span>
              </div>

              {pendingTasks.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                  No pending tasks. Great work!
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex min-w-0 flex-1 gap-3">
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            disabled={busyTask === task._id}
                            title="Mark as completed"
                            className="mt-1 shrink-0 text-slate-400 transition hover:text-green-600 disabled:opacity-50"
                          >
                            {busyTask === task._id ? (
                              <Loader2 size={23} className="animate-spin" />
                            ) : (
                              <Circle size={23} />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words font-bold text-slate-900">
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                <CalendarDays size={14} />
                                {formatDate(task.dueDate)}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 font-semibold ${
                                  priorityStyle[task.priority] ||
                                  priorityStyle.Medium
                                }`}
                              >
                                {task.priority}
                              </span>

                              {isOverdue(task) && (
                                <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                                  Overdue
                                </span>
                              )}

                              {task.reminderEnabled && task.reminderTime ? (
                                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                                  <Bell size={13} />
                                  {new Date(task.reminderTime).toLocaleString()}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <BellOff size={13} />
                                  Reminder off
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                          <button
                            onClick={() => openEditForm(task)}
                            title="Edit task"
                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            title="Delete task"
                            className="rounded-lg border border-slate-200 p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Tasks */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Completed Tasks
                </h2>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {completedTasks.length}
                </span>
              </div>

              {completedTasks.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                  Completed tasks will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-green-100 bg-green-50/50 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            disabled={busyTask === task._id}
                            title="Mark as pending"
                            className="mt-1 shrink-0 text-green-600 disabled:opacity-50"
                          >
                            {busyTask === task._id ? (
                              <Loader2 size={23} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={23} />
                            )}
                          </button>

                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-slate-500 line-through">
                              {task.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Completed · Due {formatDate(task.dueDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => openEditForm(task)}
                            title="Edit task"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            title="Delete task"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
