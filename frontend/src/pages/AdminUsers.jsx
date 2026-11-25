
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  UserRound,
  RefreshCw,
  CalendarDays,
  Mail,
  Shield,
  UserCog,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
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

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: { search: searchValue },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);

      await api.put(`/admin/users/${userId}/role`, {
        role: newRole,
      });

      await fetchUsers(search);

      alert("User role updated successfully.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update user role."
      );

      await fetchUsers(search);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const studentCount = users.filter(
    (user) => user.role === "student"
  ).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <UserCog size={17} />
                ADMINISTRATION
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                User Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                View, search and manage StudySpace users.
              </p>
            </div>

            <button
              onClick={() => fetchUsers(search)}
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

          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-lg sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <ShieldCheck size={15} />
                USER CONTROL CENTER
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Manage Your Community
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Manage student accounts, review admin access
                and keep your StudySpace community organized.
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
                  <Users size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  ALL USERS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Total Users
              </p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {users.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <UserRound size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  STUDENTS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Student Accounts
              </p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {studentCount}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <ShieldCheck size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  ADMINS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Admin Accounts
              </p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {adminCount}
              </h3>
            </div>
          </section>

          {/* Search */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Users
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search users and manage their roles.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {users.length} Users
              </span>
            </div>

            <div className="relative mt-5">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
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
                onClick={() => fetchUsers(search)}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Users Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Registered Members
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage account permissions
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <Users size={20} />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading users...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <Users size={30} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-700">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try searching with a different name or email.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Joined</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const isCurrentUser =
                        user._id === currentUser?._id;

                      const isUpdating = updatingId === user._id;

                      return (
                        <tr
                          key={user._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {user.name || "Unknown"}
                                </p>

                                {isCurrentUser && (
                                  <span className="text-xs font-medium text-indigo-600">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Mail size={15} className="shrink-0" />
                              {user.email || "N/A"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {user.role === "admin" ? (
                                <ShieldCheck
                                  size={17}
                                  className="text-purple-600"
                                />
                              ) : (
                                <UserRound
                                  size={17}
                                  className="text-blue-600"
                                />
                              )}

                              <select
                                value={user.role}
                                disabled={isCurrentUser || isUpdating}
                                onChange={(e) =>
                                  handleRoleChange(
                                    user._id,
                                    e.target.value
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition focus:border-indigo-500 ${
                                  user.role === "admin"
                                    ? "border-purple-200 bg-purple-50 text-purple-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                } ${
                                  isCurrentUser || isUpdating
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                                }`}
                              >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                              </select>

                              {isUpdating && (
                                <RefreshCw
                                  size={15}
                                  className="animate-spin text-indigo-500"
                                />
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />
                              {formatDate(user.createdAt)}
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

          {/* Security Note */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Shield size={20} className="mt-0.5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Account Security
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                Your own admin role cannot be changed from this page.
                Only authorized administrators should manage user roles.
              </p>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
