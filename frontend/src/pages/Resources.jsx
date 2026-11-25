
import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  RefreshCw,
  BookOpen,
  X,
  Sparkles,
  FolderOpen,
  Files,
  Layers,
  File,
  CheckCircle2,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const initialForm = {
  title: "",
  description: "",
  subject: "General",
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resources");
      setResources(response.data.resources || []);
    } catch (err) {
      console.error("Resources Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("subject", formData.subject);
      data.append("file", selectedFile);

      await api.post("/resources", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Resource uploaded successfully!");
      setFormData(initialForm);
      setSelectedFile(null);
      setShowForm(false);

      await fetchResources();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to upload resource."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await api.delete(`/resources/${id}`);

      setResources((previous) =>
        previous.filter((resource) => resource._id !== id)
      );

      setMessage("Resource deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete resource."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  const getFileExtension = (filename = "") => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  const filteredResources = resources.filter((resource) => {
    const text = search.toLowerCase();

    return (
      resource.title?.toLowerCase().includes(text) ||
      resource.subject?.toLowerCase().includes(text) ||
      resource.originalName?.toLowerCase().includes(text)
    );
  });

  const subjectCount = new Set(
    resources.map((item) => item.subject).filter(Boolean)
  ).size;

  return (
    <AppLayout>
      <div className="mx-auto min-w-0 max-w-6xl space-y-7 pb-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <BookOpen size={19} />
              <span className="text-xs font-bold tracking-widest">
                STUDYSPACE LIBRARY
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Resources Library
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your personal collection of notes, documents, and study materials.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchResources}
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
              {showForm ? <X size={18} /> : <Upload size={18} />}
              {showForm ? "Close Form" : "Upload Resource"}
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 text-white sm:p-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} />
              YOUR KNOWLEDGE SPACE
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Keep All Your Learning Resources in One Place.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100">
              Upload your notes, save important documents, and access your study materials whenever you need them.
            </p>

            <button
              onClick={() => {
                setShowForm(true);
                setError("");
                setMessage("");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              <Upload size={17} />
              Add Study Material
            </button>
          </div>

          <FolderOpen
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
              onClick={fetchResources}
              className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
              <Files size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Resources
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : resources.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-purple-50 p-3.5 text-purple-600">
              <Layers size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Subjects
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : subjectCount}
              </h3>
            </div>
          </div>
        </div>

        {/* UPLOAD FORM */}
        {showForm && (
          <form
            onSubmit={handleUpload}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Upload size={19} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Upload Study Material
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Add a title, subject, description, and choose your file.
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
                  Resource Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. HTML Complete Notes"
                  maxLength={150}
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
                  placeholder="Describe your study material..."
                  maxLength={500}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Web Development"
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select File
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                  <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                    <Upload size={25} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-800">
                    {selectedFile ? "File selected" : "Click to browse your files"}
                  </p>

                  <p className="mt-1 max-w-full break-all text-xs text-gray-500">
                    {selectedFile
                      ? selectedFile.name
                      : "PDF, Word, PowerPoint, Excel and TXT"}
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    required
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-xs text-gray-400">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT. Maximum 10 MB.
                </p>

                {selectedFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                    <div className="flex min-w-0 items-center gap-2 text-indigo-700">
                      <File size={18} className="shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {selectedFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-white"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
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
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  {uploading ? "Uploading..." : "Upload Resource"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, or filename..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          />
        </div>

        {/* RESOURCE LIST */}
        <div>
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Study Materials
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse and manage your uploaded documents.
              </p>
            </div>

            {!loading && (
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                {filteredResources.length} Found
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
                Loading your resources...
              </p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <BookOpen size={32} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {search ? "No Resources Found" : "Your Library is Empty"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {search
                  ? "Try searching with a different title, subject, or filename."
                  : "Upload your first study document and keep all your learning materials organized."}
              </p>

              {!search && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Upload size={17} />
                  Upload First Resource
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredResources.map((resource) => (
                <div
                  key={resource._id}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg sm:p-6"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <FileText size={24} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-gray-900">
                        {resource.title || "Untitled Resource"}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                        {resource.subject || "General"}
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  {resource.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                      {resource.description}
                    </p>
                  )}

                  {/* FILE DETAILS */}
                  <div className="mt-5 rounded-xl bg-gray-50 p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                        <File size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-700">
                          {resource.originalName || "Study document"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {getFileExtension(resource.originalName)} · {formatSize(resource.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-400">
                    <span>Uploaded on</span>
                    <span className="font-medium text-gray-500">
                      {formatDate(resource.createdAt)}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <Download size={17} />
                      Open / Download
                    </a>

                    <button
                      onClick={() => handleDelete(resource._id)}
                      disabled={deletingId === resource._id}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete resource"
                    >
                      {deletingId === resource._id ? (
                        <RefreshCw size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
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
              Your Knowledge, Always Organized
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Keep your notes and important study documents together so you can find them easily whenever you need them.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
