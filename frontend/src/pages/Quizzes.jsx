
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BookOpen,
  ClipboardList,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Play,
  Sparkles,
  Target,
  Layers,
  Clock,
  RefreshCw,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

const initialForm = {
  title: "",
  description: "",
  subject: "",
  questions: [emptyQuestion()],
};

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quizzes");
      setQuizzes(response.data.quizzes || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      questions: [emptyQuestion()],
    });
    setError("");
    setShowForm(true);
  };

  const openEditForm = async (quiz) => {
    try {
      setError("");
      const response = await api.get(`/quizzes/${quiz._id}`);
      const data = response.data.quiz;

      setEditingId(data._id);
      setFormData({
        title: data.title,
        description: data.description || "",
        subject: data.subject || "",
        questions: data.questions.map((question) => ({
          _id: question._id,
          question: question.question,
          options: [...question.options],
          correctAnswer: question.correctAnswer,
        })),
      });

      setShowForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to open quiz.");
    }
  };

  const updateQuestion = (index, field, value) => {
    setFormData((previous) => {
      const questions = [...previous.questions];
      questions[index] = {
        ...questions[index],
        [field]: value,
      };
      return { ...previous, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData((previous) => {
      const questions = [...previous.questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = value;
      questions[questionIndex] = {
        ...questions[questionIndex],
        options,
      };
      return { ...previous, questions };
    });
  };

  const addQuestion = () => {
    setFormData((previous) => ({
      ...previous,
      questions: [...previous.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) return;

    setFormData((previous) => ({
      ...previous,
      questions: previous.questions.filter(
        (_, questionIndex) => questionIndex !== index
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    const invalidQuestion = formData.questions.some(
      (question) =>
        !question.question.trim() ||
        question.options.some((option) => !option.trim()) ||
        !Number.isInteger(question.correctAnswer) ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
    );

    if (invalidQuestion) {
      setError("Please complete every question and all four options.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...formData,
        title: formData.title.trim(),
        questions: formData.questions.map((question) => ({
          ...(question._id ? { _id: question._id } : {}),
          question: question.question.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer,
        })),
      };

      if (editingId) {
        await api.put(`/quizzes/${editingId}`, payload);
      } else {
        await api.post("/quizzes", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        ...initialForm,
        questions: [emptyQuestion()],
      });

      await fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((previous) =>
        previous.filter((quiz) => quiz._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz.");
    }
  };

  const startQuiz = async (quiz) => {
    try {
      setError("");
      const response = await api.get(`/quizzes/${quiz._id}`);
      setActiveQuiz(response.data.quiz);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start quiz.");
    }
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit your quiz?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      const submittedAnswers = activeQuiz.questions.map((question) => ({
        questionId: question._id,
        selectedOption: answers[question._id] ?? null,
      }));

      const response = await api.post(
        `/quizzes/${activeQuiz._id}/submit`,
        { answers: submittedAnswers }
      );

      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit quiz.");
    } finally {
      setSaving(false);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setAnswers({});
    setResult(null);
    setError("");
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const text = search.toLowerCase();

    return (
      (quiz.title || "").toLowerCase().includes(text) ||
      (quiz.subject || "").toLowerCase().includes(text)
    );
  });

  const totalQuestions = quizzes.reduce(
    (total, quiz) => total + (quiz.questions?.length || 0),
    0
  );

  const answeredCount = Object.keys(answers).length;
  const questionCount = activeQuiz?.questions?.length || 0;
  const progress = questionCount
    ? (answeredCount / questionCount) * 100
    : 0;

  const closeForm = () => {
    setShowForm(false);
    setError("");
  };

  return (
    <AppLayout>
      <div className="min-w-0 space-y-7 pb-8">

        {!activeQuiz ? (
          <>
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  <Sparkles size={16} />
                  LEARN • PRACTICE • IMPROVE
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Quiz Center
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Challenge yourself and track your learning progress.
                </p>
              </div>

              <button
                onClick={openCreateForm}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                <Plus size={18} />
                Create Quiz
              </button>
            </div>

            {/* HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white sm:p-8">
              <div className="relative z-10 max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
                  <GraduationCap size={15} />
                  Your learning space
                </div>
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                  Knowledge grows with practice.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100">
                  Create your own quizzes, test what you know, and discover
                  where you can improve.
                </p>
                <button
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Create a new quiz
                  <ChevronRight size={17} />
                </button>
              </div>
              <div className="pointer-events-none absolute -right-8 -top-12 hidden h-64 w-64 rounded-full border-[28px] border-white/10 sm:block" />
              <div className="pointer-events-none absolute -bottom-24 right-28 hidden h-52 w-52 rounded-full bg-white/10 sm:block" />
              <BookOpen
                className="pointer-events-none absolute bottom-7 right-12 hidden text-white/20 sm:block"
                size={110}
                strokeWidth={1}
              />
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
                  <ClipboardList size={23} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Quizzes
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {quizzes.length}
                  </h2>
                </div>
                <div className="ml-auto text-xs font-medium text-indigo-600">
                  Available
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
                  <Trophy size={23} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Questions
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {totalQuestions}
                  </h2>
                </div>
                <div className="ml-auto text-xs font-medium text-amber-600">
                  Practice
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Explore Quizzes
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a quiz and test your knowledge.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search quizzes..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => setError("")}>
                  <X size={18} />
                </button>
              </div>
            )}

            {/* QUIZ LIST */}
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
                <RefreshCw className="animate-spin text-indigo-600" size={28} />
                <p className="mt-3 text-sm text-gray-500">
                  Loading your quizzes...
                </p>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <BookOpen size={30} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {search ? "No quizzes found" : "No quizzes yet"}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  {search
                    ? "Try searching with another title or subject."
                    : "Create your first quiz and start testing your knowledge."}
                </p>
                {!search && (
                  <button
                    onClick={openCreateForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus size={17} />
                    Create Your First Quiz
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-gray-400">
                  SHOWING {filteredQuizzes.length} QUIZ
                  {filteredQuizzes.length !== 1 ? "Z" : ""}
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="group flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                          <BookOpen size={23} />
                        </div>
                        <span className="max-w-[60%] truncate rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                          {quiz.subject || "General"}
                        </span>
                      </div>

                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {quiz.title}
                      </h3>

                      <p className="mt-2 min-h-[42px] break-words text-sm leading-6 text-gray-500">
                        {quiz.description || "Test your knowledge and improve your skills."}
                      </p>

                      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        <Layers size={16} className="text-indigo-500" />
                        <span className="font-medium text-gray-700">
                          {quiz.questions?.length || 0}
                        </span>
                        Questions
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          <Play size={16} fill="currentColor" />
                          Start Quiz
                        </button>

                        <button
                          onClick={() => openEditForm(quiz)}
                          className="rounded-xl border border-gray-200 p-3 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit Quiz"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deleteQuiz(quiz._id)}
                          className="rounded-xl border border-gray-200 p-3 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete Quiz"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* ACTIVE QUIZ */
          <div className="mx-auto max-w-3xl space-y-6">
            <button
              onClick={closeQuiz}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-indigo-600"
            >
              <ArrowLeft size={18} />
              Back to Quizzes
            </button>

            {!result ? (
              <>
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white shadow-lg sm:p-8">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-100">
                    <Target size={16} />
                    Quiz in progress
                  </div>
                  <h1 className="break-words text-2xl font-bold sm:text-3xl">
                    {activeQuiz.title}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-indigo-100">
                    {activeQuiz.description || "Take your time and choose the best answer."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-5 text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={17} />
                      {questionCount} Questions
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} />
                      {answeredCount} Answered
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">
                      Your progress
                    </span>
                    <span className="font-bold text-indigo-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {activeQuiz.questions.map((question, index) => (
                  <div
                    key={question._id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600">
                        Question {index + 1}
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        {index + 1} / {questionCount}
                      </span>
                    </div>

                    <h3 className="mb-6 break-words text-lg font-bold leading-7 text-gray-900">
                      {question.question}
                    </h3>

                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const selected =
                          answers[question._id] === optionIndex;

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() =>
                              selectAnswer(question._id, optionIndex)
                            }
                            className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                                : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                selected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span
                              className={`min-w-0 break-words text-sm font-medium ${
                                selected ? "text-indigo-700" : "text-gray-700"
                              }`}
                            >
                              {option}
                            </span>
                            {selected && (
                              <CheckCircle2
                                className="ml-auto shrink-0 text-indigo-600"
                                size={19}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <button
                    onClick={submitQuiz}
                    disabled={
                      saving ||
                      answeredCount !== questionCount ||
                      questionCount === 0
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Submit Quiz
                      </>
                    )}
                  </button>

                  {answeredCount !== questionCount && (
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Answer all {questionCount - answeredCount} remaining
                      question(s) before submitting.
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* RESULT */
              <>
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-7 text-center text-white shadow-lg sm:p-10">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Trophy size={40} />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
                    Quiz completed
                  </p>
                  <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                    Great job!
                  </h1>
                  <p className="mt-2 text-sm text-indigo-100">
                    {activeQuiz.title}
                  </p>

                  <div className="my-7">
                    <div className="text-6xl font-extrabold tracking-tight">
                      {result.percentage}%
                    </div>
                    <p className="mt-2 text-sm text-indigo-100">
                      Your final score
                    </p>
                  </div>

                  <div className="mx-auto flex max-w-xs justify-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4">
                    <div>
                      <p className="text-2xl font-bold">{result.score}</p>
                      <p className="text-xs text-indigo-100">Correct</p>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div>
                      <p className="text-2xl font-bold">
                        {result.totalQuestions}
                      </p>
                      <p className="text-xs text-indigo-100">Total</p>
                    </div>
                  </div>

                  <p className="mt-6 text-sm font-medium text-indigo-100">
                    {result.percentage >= 80
                      ? "Excellent work! Keep it up."
                      : result.percentage >= 50
                      ? "Good effort! Keep practicing."
                      : "Keep learning. You can improve!"}
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Answer Review
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Review your answers and learn from your mistakes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {result.results.map((item, index) => (
                      <div
                        key={item.questionId}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                      >
                        <div className="mb-4 flex items-start gap-3">
                          {item.isCorrect ? (
                            <CheckCircle2
                              className="mt-0.5 shrink-0 text-green-600"
                              size={21}
                            />
                          ) : (
                            <XCircle
                              className="mt-0.5 shrink-0 text-red-500"
                              size={21}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Question {index + 1}
                            </p>
                            <h3 className="break-words font-semibold leading-6 text-gray-900">
                              {item.question}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-2 pl-8 text-sm">
                          <p className="break-words text-gray-600">
                            Your answer:{" "}
                            <span className="font-semibold text-gray-800">
                              {item.selectedOption === null
                                ? "Not answered"
                                : activeQuiz.questions[index].options[
                                    item.selectedOption
                                  ]}
                            </span>
                          </p>

                          {!item.isCorrect && (
                            <p className="break-words text-green-700">
                              Correct answer:{" "}
                              <span className="font-semibold">
                                {activeQuiz.questions[index].options[
                                  item.correctAnswer
                                ]}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pl-8">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.isCorrect
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={closeQuiz}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <ArrowLeft size={18} />
                  Back to Quiz Center
                </button>
              </>
            )}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5">
            <div className="my-auto max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    <Sparkles size={14} />
                    Quiz builder
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {editingId ? "Edit Quiz" : "Create New Quiz"}
                  </h2>
                </div>

                <button
                  onClick={closeForm}
                  type="button"
                  className="rounded-xl bg-gray-100 p-2.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Quiz Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      maxLength={150}
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. HTML Basics Quiz"
                      className="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      maxLength={500}
                      rows={3}
                      placeholder="Describe what this quiz covers..."
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Subject
                    </label>
                    <input
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject: e.target.value,
                        })
                      }
                      placeholder="e.g. HTML, JavaScript, Mathematics"
                      className="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Quiz Questions
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Add questions and select the correct answer.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                    >
                      <Plus size={17} />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-5">
                    {formData.questions.map((question, questionIndex) => (
                      <div
                        key={question._id || questionIndex}
                        className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                              {String(questionIndex + 1).padStart(2, "0")}
                            </span>
                            <h4 className="font-bold text-gray-800">
                              Question {questionIndex + 1}
                            </h4>
                          </div>

                          <button
                            type="button"
                            disabled={formData.questions.length === 1}
                            onClick={() => removeQuestion(questionIndex)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Remove question"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <textarea
                          required
                          maxLength={500}
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "question",
                              e.target.value
                            )
                          }
                          rows={2}
                          placeholder="Write your question here..."
                          className="mb-5 w-full resize-y rounded-xl border border-gray-200 bg-white p-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />

                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Answer Options
                        </p>

                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`flex min-w-0 items-center gap-3 rounded-xl border p-2.5 transition ${
                                question.correctAnswer === optionIndex
                                  ? "border-green-300 bg-green-50/70"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <label
                                className="flex shrink-0 cursor-pointer items-center gap-2"
                                title="Set as correct answer"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={
                                    question.correctAnswer === optionIndex
                                  }
                                  onChange={() =>
                                    updateQuestion(
                                      questionIndex,
                                      "correctAnswer",
                                      optionIndex
                                    )
                                  }
                                  className="h-4 w-4 accent-green-600"
                                />
                                <span
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                                    question.correctAnswer === optionIndex
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                              </label>

                              <input
                                required
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${String.fromCharCode(
                                  65 + optionIndex
                                )}`}
                                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2 size={14} className="text-green-600" />
                          Select the radio button beside the correct answer.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                      <X size={17} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        {editingId ? "Update Quiz" : "Create Quiz"}
                      </>
                    )}
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
