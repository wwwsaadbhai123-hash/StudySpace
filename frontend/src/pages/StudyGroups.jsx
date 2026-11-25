
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  X,
  UserPlus,
  UserMinus,
  UsersRound,
  Eye,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function StudyGroups() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [busyGroup, setBusyGroup] = useState("");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/groups");
      setGroups(response.data.groups || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load groups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      await api.post("/groups", {
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      setShowForm(false);

      await fetchGroups();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create group."
      );
    } finally {
      setCreating(false);
    }
  };

  const isMember = (group) =>
    Boolean(
      userId &&
      group.members?.some(
        (member) =>
          String(member?._id || member) === String(userId)
      )
    );

  const isCreator = (group) =>
    String(group.createdBy?._id || group.createdBy) ===
    String(userId);

  const handleMembership = async (group) => {
    try {
      setBusyGroup(group._id);
      setError("");

      if (isMember(group)) {
        await api.post(`/groups/${group._id}/leave`);
      } else {
        await api.post(`/groups/${group._id}/join`);
      }

      await fetchGroups();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update membership."
      );
    } finally {
      setBusyGroup("");
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(search.toLowerCase())
  );

  const closeForm = () => {
    if (creating) return;
    setShowForm(false);
    setName("");
    setDescription("");
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-600">
              Learn and collaborate
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Study Groups
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Connect with students and learn together.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={19} />
            Create Group
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <UsersRound size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Groups</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {groups.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Joined Groups</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {groups.filter(isMember).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={19} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study groups..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <p className="break-words">{error}</p>
            <button
              onClick={() => setError("")}
              aria-label="Close error"
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Groups */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={30} className="animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading study groups...
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UsersRound size={32} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              {search ? "No groups found" : "No study groups yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try another search."
                : "Create the first group and invite others to learn together."}
            </p>

            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Users size={25} />
                  </div>

                  {isCreator(group) && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      Your Group
                    </span>
                  )}
                </div>

                <h3 className="mt-5 break-words text-lg font-bold text-slate-900">
                  {group.name}
                </h3>

                <p className="mt-2 min-h-10 break-words text-sm leading-6 text-slate-500">
                  {group.description || "No description added."}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users size={17} />
                    {group.members?.length || 0} members
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    {isMember(group) ? "Joined" : "Open Group"}
                  </span>
                </div>

                {/* Join / Leave */}
                <button
                  onClick={() => handleMembership(group)}
                  disabled={
                    busyGroup === group._id ||
                    !userId ||
                    (isCreator(group) && isMember(group))
                  }
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isMember(group)
                      ? "border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {busyGroup === group._id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Please wait...
                    </>
                  ) : isMember(group) ? (
                    <>
                      <UserMinus size={16} />
                      {isCreator(group) ? "Group Creator" : "Leave Group"}
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Join Group
                    </>
                  )}
                </button>

                {/* View Details */}
                <button
                  onClick={() =>
                    navigate(`/study-groups/${group._id}`)
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"
            onClick={closeForm}
          >
            <div className="flex min-h-full items-center justify-center">
              <div
                className="my-6 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <UsersRound size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Create Study Group
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Start learning together
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeForm}
                    disabled={creating}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={createGroup} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Group Name
                    </label>

                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. React Developers"
                      required
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What will this group study?"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={creating}
                      className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={creating || !name.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creating ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Create Group
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
