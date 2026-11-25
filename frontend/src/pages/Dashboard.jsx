
import { useEffect, useState } from "react";
import {
  Plus, Clock, FileText, ArrowUpRight, Users,
  FolderOpen, GraduationCap, CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [folderCount, setFolderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [notesResponse, groupsResponse, foldersResponse] =
          await Promise.all([
            api.get("/notes"),
            api.get("/groups"),
            api.get("/folders"),
          ]);

        setNotes(notesResponse.data.notes || []);
        setGroups(groupsResponse.data.groups || []);
        setFolderCount((foldersResponse.data.folders || []).length);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "";

  const stats = [
    { label: "Total Notes", value: notes.length, icon: FileText },
    { label: "Study Hours", value: "—", icon: Clock },
    { label: "My Study Groups", value: groups.length, icon: Users },
    { label: "My Folders", value: folderCount, icon: FolderOpen },
  ];

  const formatDate = (date) => {
    if (!date) return "—";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Page heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Your personal workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Welcome */}
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white shadow-sm sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-56 w-56 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                Welcome to StudySpace
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                {firstName ? `Welcome back, ${firstName}!` : "Learn together. Grow together."}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Your notes, study groups and learning progress — all in one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/my-notes")}
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <Plus size={19} />
              Create New Note
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = [
              "bg-indigo-50 text-indigo-600",
              "bg-amber-50 text-amber-600",
              "bg-purple-50 text-purple-600",
              "bg-emerald-50 text-emerald-600",
            ];

            return (
              <div
                key={stat.label}
                className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[index]}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "..." : stat.value}
                  </p>
                  {stat.label === "Study Hours" && (
                    <p className="mt-1 text-xs text-slate-400">Tracking not available yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Main cards */}
        <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Recent Notes */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Notes</h3>
                <p className="mt-1 text-sm text-slate-500">Continue where you left off</p>
              </div>
              <button
                onClick={() => navigate("/my-notes")}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <FileText size={26} />
                </div>
                <p className="mt-4 font-semibold text-slate-800">No notes yet</p>
                <p className="mt-1 text-sm text-slate-500">Create your first study note to get started.</p>
                <button
                  onClick={() => navigate("/my-notes")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} /> Create Note
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4 sm:px-6">Title</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right sm:px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.slice(0, 5).map(note => (
                      <tr key={note._id} className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50">
                        <td className="max-w-[280px] px-5 py-4 sm:px-6">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <FileText size={18} />
                            </div>
                            <span className="truncate text-sm font-semibold text-slate-800">
                              {note.title || "Untitled Note"}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(note.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right sm:px-6">
                          <button
                            onClick={() => navigate("/my-notes")}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                          >
                            Notes <ArrowUpRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Study Groups */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Study Groups</h3>
                <p className="mt-1 text-sm text-slate-500">Learn with your community</p>
              </div>
              <span className="text-sm font-medium text-slate-400">
                {loading ? "..." : groups.length}
              </span>
            </div>

            <div className="flex-1 px-5 py-5">
              {loading ? (
                <p className="py-10 text-center text-sm text-slate-500">Loading groups...</p>
              ) : groups.length === 0 ? (
                <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <Users size={27} />
                  </div>
                  <p className="mt-4 font-semibold text-slate-800">No study groups yet</p>
                  <p className="mt-1 max-w-[220px] text-sm leading-6 text-slate-500">
                    Join or create a study group to learn with others.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.slice(0, 5).map(group => (
                    <button
                      key={group._id}
                      onClick={() => navigate(`/study-groups/${group._id}`)}
                      className="flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <GraduationCap size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{group.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{group.members?.length || 0} members</p>
                      </div>
                      <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={() => navigate("/study-groups")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                <Plus size={17} /> Explore Study Groups
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          © 2026 StudySpace. Learn, collaborate and grow.
        </footer>
      </div>
    </AppLayout>
  );
}
