
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  RefreshCw,
  Trash2,
  Bug,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Headphones,
  Sparkles,
  Inbox,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const initialForm = {
  subject: "",
  message: "",
  type: "Feedback",
};

const typeIcons = {
  Feedback: MessageCircle,
  "Bug Report": Bug,
  "Feature Request": Lightbulb,
  Other: HelpCircle,
};

const typeColors = {
  Feedback: "bg-blue-50 text-blue-600",
  "Bug Report": "bg-red-50 text-red-600",
  "Feature Request": "bg-purple-50 text-purple-600",
  Other: "bg-slate-100 text-slate-600",
};

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  Resolved: "bg-green-50 text-green-700 border-green-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
};

export default function Feedback() {
  const [formData, setFormData] = useState(initialForm);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/feedback");
      setFeedback(response.data.feedback || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await api.post("/feedback", formData);

      setFormData(initialForm);
      setMessage("Your feedback has been submitted successfully!");

      await fetchFeedback();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit feedback."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pending feedback?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/feedback/${id}`);

      setFeedback((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage("Feedback deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete feedback."
      );
    }
  };

  const pendingCount = feedback.filter(
    (item) => item.status === "Pending"
  ).length;

  const resolvedCount = feedback.filter(
    (item) => item.status === "Resolved"
  ).length;

  return (
    <AppLayout>
      <div className="mx-auto min-w-0 max-w-6xl space-y-7 pb-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <Headphones size={19} />
              <span className="text-xs font-bold tracking-widest">
                STUDYSPACE SUPPORT CENTER
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Feedback & Support
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Your ideas and feedback help make StudySpace better.
            </p>
          </div>

          <button
            onClick={fetchFeedback}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 text-white sm:p-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} />
              WE VALUE YOUR VOICE
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Help us improve your learning experience.
            </h2>

            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Found a bug, have a suggestion, or need help?
              Send us a message and share your thoughts.
            </p>
          </div>

          <MessageSquare
            size={125}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-5 right-7 hidden text-white/15 sm:block"
          />

          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-white/10" />
        </div>

        {/* NOTIFICATIONS */}
        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <HelpCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
              <Inbox size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Submissions</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "—" : feedback.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
              <Clock size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "—" : pendingCount}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-green-50 p-3.5 text-green-600">
              <CheckCircle2 size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Resolved</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "—" : resolvedCount}
              </h3>
            </div>
          </div>
        </div>

        {/* FEEDBACK FORM */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Send size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Submit Your Feedback
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tell us what is on your mind.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

            {/* TYPE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Feedback Type
              </label>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    value: "Feedback",
                    label: "General",
                    Icon: MessageCircle,
                  },
                  {
                    value: "Bug Report",
                    label: "Bug Report",
                    Icon: Bug,
                  },
                  {
                    value: "Feature Request",
                    label: "Feature Idea",
                    Icon: Lightbulb,
                  },
                  {
                    value: "Other",
                    label: "Other",
                    Icon: HelpCircle,
                  },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        type: value,
                      }))
                    }
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                      formData.type === value
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-semibold">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SUBJECT */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter feedback subject..."
                maxLength={150}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Message
                </label>

                <span className="text-xs text-slate-400">
                  {formData.message.length}/2000
                </span>
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your feedback or explain the issue..."
                rows={5}
                maxLength={2000}
                required
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-400">
                Please provide clear details so we can understand your message.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>

        {/* MY SUBMISSIONS */}
        <div>
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Submissions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track the status of your messages.
              </p>
            </div>

            {!loading && (
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                {feedback.length} Total
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white py-14 text-center">
              <RefreshCw
                size={27}
                className="mx-auto animate-spin text-indigo-600"
              />
              <p className="mt-3 text-sm text-slate-500">
                Loading submissions...
              </p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                <MessageSquare size={30} />
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                No Submissions Yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Your feedback and support requests will appear here once you submit them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => {
                const Icon = typeIcons[item.type] || HelpCircle;

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-indigo-100 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`shrink-0 rounded-xl p-3 ${
                            typeColors[item.type] || typeColors.Other
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-slate-900">
                            {item.subject}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-indigo-600">
                            {item.type}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          statusStyles[item.status] ||
                          "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {item.message}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        Submitted:{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>

                      {item.status === "Pending" && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-slate-400">
          <CheckCircle2 size={15} />
          Thank you for helping us make StudySpace better!
        </div>
      </div>
    </AppLayout>
  );
}
