
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Folder,
  Trash2,
  RefreshCw,
  ShieldCheck,
  CalendarDays,
  UserRound,
  Mail,
  Filter,
  FolderOpen,
  Files,
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

export default function AdminFolders() {
  const [folders, setFolders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/folders", {
        params: { search },
      });

      setFolders(response.data.folders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load folders."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchFolders, 400);

    return () => clearTimeout(timeout);
  }, [fetchFolders]);

  const handleDelete = async (folderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this folder?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(folderId);

      await api.delete(`/admin/folders/${folderId}`);

      setFolders((previous) =>
        previous.filter((folder) => folder._id !== folderId)
      );

      alert("Folder deleted successfully.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete folder."
      );
    } finally {
      setDeletingId(null);
    }
  };

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
                Folder Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                View and manage folders created by all students.
              </p>
            </div>

            <button
              onClick={fetchFolders}
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
                <FolderOpen size={15} />
                CONTENT ORGANIZATION CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Manage Student Folders
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Monitor folders created by students and keep
                learning resources organized throughout StudySpace.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Folder size={22} />
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  ORGANIZATION
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Folders
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {folders.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Files size={22} />
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  CONTENT
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Student Collections
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {folders.length}
              </h3>
            </div>
          </section>

          {/* Search */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Filter size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Search Folders
                </h2>

                <p className="text-xs text-slate-500">
                  Find folders by name or description.
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search folder name or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
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
                onClick={fetchFolders}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Folders Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  All Student Folders
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  View folder details and manage student collections.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {folders.length} Folders
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading folders...
                </p>
              </div>
            ) : folders.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <FolderOpen size={32} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No folders found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try searching with a different folder name.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">Folder</th>
                      <th className="px-5 py-4 font-semibold">Created By</th>
                      <th className="px-5 py-4 font-semibold">Description</th>
                      <th className="px-5 py-4 font-semibold">Created</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {folders.map((folder) => {
                      const isDeleting = deletingId === folder._id;

                      return (
                        <tr
                          key={folder._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* Folder */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Folder size={21} />
                              </div>

                              <p className="max-w-[180px] break-words font-semibold text-slate-800">
                                {folder.name || "Untitled Folder"}
                              </p>
                            </div>
                          </td>

                          {/* Creator */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <UserRound size={17} />
                              </div>

                              <div className="max-w-[170px]">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {folder.user?.name || "Unknown"}
                                </p>

                                <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                                  <Mail size={12} />
                                  {folder.user?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-5 py-4">
                            <p className="max-w-[230px] text-sm leading-5 text-slate-500">
                              {folder.description || "No description"}
                            </p>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />
                              {formatDate(folder.createdAt)}
                            </div>
                          </td>

                          {/* Delete */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDelete(folder._id)}
                              disabled={isDeleting}
                              title="Delete folder"
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
            <p>StudySpace Folder Management</p>
            <p>Admin Content Control Center</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
