
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RotateCw,
  Layers,
  BookOpen,
  Sparkles,
  Brain,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const initialForm = {
  question: "",
  answer: "",
  subject: "",
  difficulty: "Medium",
};

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/flashcards");
      setFlashcards(response.data.flashcards || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (card) => {
    setEditingId(card._id);
    setFormData({
      question: card.question,
      answer: card.answer,
      subject: card.subject || "",
      difficulty: card.difficulty || "Medium",
    });
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.put(`/flashcards/${editingId}`, formData);
      } else {
        await api.post("/flashcards", formData);
      }

      closeForm();
      await fetchFlashcards();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save flashcard."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteFlashcard = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/flashcards/${id}`);

      setFlashcards((previous) =>
        previous.filter((card) => card._id !== id)
      );

      setFlippedCards((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete flashcard."
      );
    }
  };

  const toggleFlip = (id) => {
    setFlippedCards((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const filteredCards = flashcards.filter((card) => {
    const searchText = search.toLowerCase();

    return (
      (card.question || "").toLowerCase().includes(searchText) ||
      (card.answer || "").toLowerCase().includes(searchText) ||
      (card.subject || "").toLowerCase().includes(searchText)
    );
  });

  const subjectsCount = new Set(
    flashcards.map((card) => card.subject?.trim() || "General")
  ).size;

  const difficultyStyle = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    Hard: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <AppLayout>
      <div className="space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                <GraduationCap size={22} />
              </div>

              <span className="text-sm font-semibold text-indigo-600">
                ACTIVE LEARNING
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Flashcards
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create, review and remember what you learn.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <Plus size={19} />
            Create Flashcard
          </button>
        </div>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-violet-700 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-10 -top-14 h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-lg">
              <div className="mb-3 flex items-center gap-2 text-blue-100">
                <Sparkles size={18} />
                <span className="text-xs font-bold tracking-widest">
                  LEARN SMARTER
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Test your knowledge, one card at a time!
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Turn important concepts into flashcards and practice
                active recall to remember information longer.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <Brain size={42} />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Layers size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                COLLECTION
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Total Flashcards
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {flashcards.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <BookOpen size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                LEARNING AREAS
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Subjects
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {subjectsCount}
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, answers or subjects..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              {search ? "Search results" : "Your flashcard collection"}
            </span>

            <span className="font-semibold text-slate-500">
              {filteredCards.length} cards
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>

            <button
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Flashcards */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading flashcards...
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <BookOpen size={32} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              {search ? "No flashcards found" : "No flashcards yet"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try another search keyword."
                : "Create your first flashcard and start learning."}
            </p>

            {!search && (
              <button
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Your First Card
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card) => {
              const isFlipped = !!flippedCards[card._id];

              return (
                <div
                  key={card._id}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                >
                  {/* Card Face */}
                  <button
                    type="button"
                    onClick={() => toggleFlip(card._id)}
                    className={`relative flex min-h-64 w-full flex-col items-center justify-center overflow-hidden p-6 text-center transition duration-300 ${
                      isFlipped
                        ? "bg-gradient-to-br from-violet-50 to-indigo-100"
                        : "bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100"
                    }`}
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/50" />

                    <div className="relative z-10">
                      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                        {isFlipped ? (
                          <BookOpen size={23} />
                        ) : (
                          <Brain size={23} />
                        )}
                      </div>

                      <span
                        className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold tracking-wider ${
                          isFlipped
                            ? "bg-violet-100 text-violet-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {isFlipped ? "ANSWER" : "QUESTION"}
                      </span>

                      <p className="mt-5 break-words text-lg font-bold leading-7 text-slate-800">
                        {isFlipped ? card.answer : card.question}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                        <RotateCw size={14} />
                        Click to {isFlipped ? "see question" : "reveal answer"}
                      </span>
                    </div>
                  </button>

                  {/* Card Details */}
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="max-w-[65%] truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {card.subject || "General"}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          difficultyStyle[card.difficulty] ||
                          difficultyStyle.Medium
                        }`}
                      >
                        {card.difficulty || "Medium"}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => openEditForm(card)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteFlashcard(card._id)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                    {editingId ? (
                      <Pencil size={21} />
                    ) : (
                      <Plus size={21} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingId ? "Edit Flashcard" : "Create Flashcard"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Add information to your learning collection.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Question
                  </label>

                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={3}
                    placeholder="Write your question..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Answer
                  </label>

                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    required
                    maxLength={2000}
                    rows={4}
                    placeholder="Write the correct answer..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. HTML, JavaScript, Mathematics"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <Plus size={17} />
                    )}

                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Flashcard"
                      : "Create Flashcard"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
