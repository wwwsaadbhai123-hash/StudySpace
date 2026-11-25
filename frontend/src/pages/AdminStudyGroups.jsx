
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  Trash2,
  RefreshCw,
  UsersRound,
  ShieldCheck,
  CalendarDays,
  UserRound,
  BookOpen,
  Filter,
  Mail,
  FolderOpen,
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

export default function AdminStudyGroups() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/study-groups", {
        params: { search },
      });

      setGroups(response.data.groups || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load study groups."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchGroups, 400);

    return () => clearTimeout(timeout);
  }, [fetchGroups]);

  const handleDelete = async (groupId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this study group?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(groupId);

      await api.delete(`/admin/study-groups/${groupId}`);

      setGroups((previous) =>
        previous.filter((group) => group._id !== groupId)
      );

      alert("Study group deleted successfully.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete study group."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalMembers = groups.reduce(
    (total, group) => total + (group.members?.length || 0),
    0
  );

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
                Study Group Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                View and manage all study groups created by students.
              </p>
            </div>

            <button
              onClick={fetchGroups}
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
                <UsersRound size={15} />
                COMMUNITY CONTROL CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Manage Study Communities
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Monitor student-created groups, view group owners
                and keep the StudySpace community organized.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <UsersRound size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  COMMUNITY
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Study Groups
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {groups.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Users size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  PARTICIPANTS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Group Memberships
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {totalMembers}
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
                  Search Groups
                </h2>
                <p className="text-xs text-slate-500">
                  Find groups by name or description.
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
                placeholder="Search group name or description..."
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
                onClick={fetchGroups}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Groups Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Registered Study Groups
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage student-created communities.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {groups.length} Groups
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading study groups...
                </p>
              </div>
            ) : groups.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <FolderOpen size={32} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No study groups found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try searching with a different group name.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-semibold">Group</th>
                      <th className="px-5 py-4 font-semibold">Created By</th>
                      <th className="px-5 py-4 font-semibold">Members</th>
                      <th className="px-5 py-4 font-semibold">Created</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {groups.map((group) => {
                      const isDeleting = deletingId === group._id;

                      return (
                        <tr
                          key={group._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* Group */}
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <BookOpen size={21} />
                              </div>

                              <div className="max-w-[250px]">
                                <p className="break-words font-semibold text-slate-800">
                                  {group.name || "Untitled Group"}
                                </p>

                                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                                  {group.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Creator */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <UserRound size={17} />
                              </div>

                              <div className="max-w-[180px]">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {group.createdBy?.name || "Unknown"}
                                </p>

                                <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                                  <Mail size={12} />
                                  {group.createdBy?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Members */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              <Users size={14} />
                              {group.members?.length || 0} Members
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />
                              {formatDate(group.createdAt)}
                            </div>
                          </td>

                          {/* Delete */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDelete(group._id)}
                              disabled={isDeleting}
                              title="Delete study group"
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
            <p>StudySpace Study Group Management</p>
            <p>Admin Community Control Center</p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
