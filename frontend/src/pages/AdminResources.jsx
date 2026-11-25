
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Library,
  Trash2,
  Download,
  RefreshCw,
  FileText,
  ShieldCheck,
  CalendarDays,
  UserRound,
  HardDrive,
  BookOpen,
  Filter,
  FolderOpen,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const formatSize = (bytes) => {
  const size = Number(bytes) || 0;

  if (size < 1024) return `${size} Bytes`;

  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

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

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/resources", {
        params: { search, subject },
      });

      setResources(response.data.resources || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  }, [search, subject]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResources();
    }, 400);

    return () => clearTimeout(timeout);
  }, [fetchResources]);

  const handleDelete = async (resourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource permanently?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(resourceId);

      await api.delete(`/admin/resources/${resourceId}`);

      setResources((previous) =>
        previous.filter((item) => item._id !== resourceId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete resource."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalSize = resources.reduce(
    (total, item) => total + (Number(item.fileSize) || 0),
    0
  );

  const uniqueSubjects = new Set(
    resources.map((item) => item.subject || "General")
  ).size;

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
                Resource Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                View and manage resources uploaded by all students.
              </p>
            </div>

            <button
              onClick={fetchResources}
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
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-lg sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Library size={15} />
                RESOURCE CONTROL CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Manage Learning Resources
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Monitor uploaded study materials, organize
                subjects and manage shared learning resources.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Library size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  LIBRARY
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Resources
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {resources.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <BookOpen size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  CATEGORIES
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Unique Subjects
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {uniqueSubjects}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <HardDrive size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  STORAGE
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Loaded File Size
              </p>

              <h3 className="mt-1 break-words text-3xl font-bold text-slate-900">
                {formatSize(totalSize)}
              </h3>
            </div>
          </section>

          {/* Search & Filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Filter size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Search & Filters
                </h2>
                <p className="text-xs text-slate-500">
                  Find resources by title, filename or subject.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or file name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Filter by subject..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                onClick={fetchResources}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Resources Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Uploaded Resources
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  All student uploaded study materials.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {resources.length} Resources
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading resources...
                </p>
              </div>
            ) : resources.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <FolderOpen size={32} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No resources found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try another search or subject filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">Resource</th>
                      <th className="px-5 py-4 font-semibold">Subject</th>
                      <th className="px-5 py-4 font-semibold">Uploaded By</th>
                      <th className="px-5 py-4 font-semibold">File Size</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {resources.map((item) => {
                      const isDeleting = deletingId === item._id;

                      return (
                        <tr
                          key={item._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* Resource */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText size={21} />
                              </div>

                              <div className="min-w-0 max-w-[220px]">
                                <p className="break-words font-semibold text-slate-800">
                                  {item.title || "Untitled Resource"}
                                </p>

                                <p className="mt-1 break-all text-xs text-slate-400">
                                  {item.originalName || "File"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {item.subject || "General"}
                            </span>
                          </td>

                          {/* Uploader */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <UserRound size={17} />
                              </div>

                              <div className="min-w-0 max-w-[180px]">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {item.user?.name || "Unknown"}
                                </p>

                                <p className="truncate text-xs text-slate-400">
                                  {item.user?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Size */}
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatSize(item.fileSize)}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Download resource"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                              >
                                <Download size={17} />
                              </a>

                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={isDeleting}
                                title="Delete resource"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={17} />
                                )}
                              </button>
                            </div>
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
            <p>StudySpace Resource Management</p>
            <p>Admin Resource Control Center</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
