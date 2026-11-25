
import { useEffect, useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Target,
  Clock,
  BookOpen,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  X,
  Sparkles,
  Flag,
  TrendingUp,
  Award,
  CalendarCheck,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const initialForm = {
  title: "",
  description: "",
  challengeType: "Tasks",
  target: 10,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

export default function StudyChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/study-challenges");
      setChallenges(response.data.challenges || []);
    } catch (err) {
      console.error("Challenges Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load study challenges."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/study-challenges", {
        ...formData,
        target: Number(formData.target),
      });

      setMessage("Study challenge created successfully!");
      setFormData({
        ...initialForm,
        startDate: new Date().toISOString().slice(0, 10),
      });
      setShowForm(false);

      await fetchChallenges();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create challenge."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this challenge?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await api.delete(`/study-challenges/${id}`);

      setChallenges((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage("Challenge deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete challenge."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type) => {
    if (type === "Tasks") return "Completed Tasks";
    if (type === "FocusMinutes") return "Focus Minutes";
    return "Focus Sessions";
  };

  const getTypeIcon = (type, size = 21) => {
    if (type === "Tasks") return <BookOpen size={size} />;
    if (type === "FocusMinutes") return <Clock size={size} />;
    return <Target size={size} />;
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "Expired") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getProgress = (challenge) => {
    const percentage = Number(challenge.percentage) || 0;
    return Math.min(100, Math.max(0, percentage));
  };

  const completedCount = challenges.filter(
    (item) => item.status === "Completed"
  ).length;

  const activeCount = challenges.filter(
    (item) => item.status !== "Completed" && item.status !== "Expired"
  ).length;

  const totalChallenges = challenges.length;

  return (
    <AppLayout>
      <div className="mx-auto min-w-0 max-w-6xl space-y-7 pb-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <Trophy size={19} />
              <span className="text-xs font-bold tracking-widest">
                STUDYSPACE CHALLENGES
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Study Challenges
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Set goals, challenge yourself, and turn small steps into big achievements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchChallenges}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 sm:flex-none"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setMessage("");
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Close Form" : "New Challenge"}
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 text-white sm:p-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} />
              CHALLENGE YOURSELF
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Make Every Study Day Count!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100">
              Create personal challenges, stay consistent, and track how far you have come.
            </p>

            <button
              onClick={() => {
                setShowForm(true);
                setError("");
                setMessage("");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              <Plus size={17} />
              Create a Challenge
            </button>
          </div>

          <Trophy
            size={145}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-7 right-8 hidden text-white/15 sm:block"
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-white/10" />
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={19} className="shrink-0" />
            {message}
            <button
              onClick={() => setMessage("")}
              className="ml-auto"
              aria-label="Close message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchChallenges}
              className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
              <Flag size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Challenges
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : totalChallenges}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
              <TrendingUp size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Challenges
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : activeCount}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
              <Award size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : completedCount}
              </h3>
            </div>
          </div>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Plus size={19} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Create New Challenge
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Set a target and choose your challenge duration.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Challenge Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. 7 Days Study Challenge"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you want to achieve..."
                  maxLength={500}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Challenge Type
                  </label>
                  <select
                    name="challengeType"
                    value={formData.challengeType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="Tasks">Completed Tasks</option>
                    <option value="FocusMinutes">Focus Minutes</option>
                    <option value="FocusSessions">Focus Sessions</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Target
                  </label>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving ? "Creating..." : "Create Challenge"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CHALLENGE LIST */}
        <div>
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Challenges
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your goals and celebrate your achievements.
              </p>
            </div>

            {!loading && (
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                {totalChallenges} Total
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-indigo-600"
              />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Loading your challenges...
              </p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Trophy size={32} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No Challenges Yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                You haven't created any challenges yet. Start with a small goal and build your consistency.
              </p>

              <button
                onClick={() => {
                  setShowForm(true);
                  setError("");
                  setMessage("");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Your First Challenge
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {challenges.map((challenge) => {
                const progress = getProgress(challenge);

                return (
                  <div
                    key={challenge._id}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg sm:p-6"
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          {getTypeIcon(challenge.challengeType)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-gray-900">
                            {challenge.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            {getTypeLabel(challenge.challengeType)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${getStatusStyle(challenge.status)}`}
                      >
                        {challenge.status || "Active"}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    {challenge.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                        {challenge.description}
                      </p>
                    )}

                    {/* PROGRESS */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Your Progress
                        </span>
                        <span className="text-sm font-extrabold text-indigo-600">
                          {challenge.progress || 0} / {challenge.target}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            challenge.status === "Completed"
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-indigo-500 to-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Completion
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    {/* DATE DETAILS */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <CalendarDays size={14} />
                          <span className="text-[11px] font-medium">
                            Start Date
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-gray-700">
                          {formatDate(challenge.startDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <CalendarCheck size={14} />
                          <span className="text-[11px] font-medium">
                            End Date
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-gray-700">
                          {formatDate(challenge.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      {challenge.status === "Completed" ? (
                        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-600">
                          <CheckCircle2 size={18} className="shrink-0" />
                          <span>Challenge completed!</span>
                        </div>
                      ) : challenge.status === "Expired" ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                          <CalendarDays size={17} />
                          Challenge expired
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Target size={17} className="text-indigo-500" />
                          Keep going!
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(challenge._id)}
                        disabled={deletingId === challenge._id}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === challenge._id ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        {deletingId === challenge._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM TIP */}
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              Small Steps, Big Results
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Stay consistent with your daily goals. Every completed task and focused minute brings you closer to success.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
