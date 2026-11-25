
import { useEffect, useState } from "react";
import {
  Plus,
  Folder,
  Trash2,
  X,
  Search,
  FolderOpen,
  Loader2,
  CalendarDays,
} from "lucide-react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function MyFolders() {
  const [folders, setFolders] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/folders");
      setFolders(response.data.folders || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load folders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const createFolder = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      const response = await api.post("/folders", {
        name: name.trim(),
        description: description.trim(),
      });

      setFolders((prev) => [response.data.folder, ...prev]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create folder."
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteFolder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this folder?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/folders/${id}`);
      setFolders((prev) =>
        prev.filter((folder) => folder._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete folder."
      );
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name?.toLowerCase().includes(search.toLowerCase())
  );

  const closeForm = () => {
    setShowForm(false);
    setName("");
    setDescription("");
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-600">
              Organize your study materials
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Folders
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Keep your notes organized in one place.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={19} />
            New Folder
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FolderOpen size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Folders</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {folders.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <CalendarDays size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Your Workspace</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Study Folders
              </h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={19} className="shrink-0 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your folders..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <p className="min-w-0 break-words">{error}</p>
            <button
              onClick={() => setError("")}
              className="shrink-0"
              aria-label="Close error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Folder Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={30} className="animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your folders...
            </p>
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Folder size={32} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              {search ? "No folders found" : "No folders yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try searching with another folder name."
                : "Create your first folder and start organizing your study notes."}
            </p>

            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Create First Folder
              </button>
            )}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFolders.map((folder) => (
              <div
                key={folder._id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Folder size={25} />
                  </div>

                  <button
                    onClick={() => deleteFolder(folder._id)}
                    aria-label="Delete folder"
                    title="Delete folder"
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="mt-5 break-words text-lg font-bold text-slate-800">
                  {folder.name}
                </h3>

                <p className="mt-2 min-h-10 break-words text-sm leading-6 text-slate-500">
                  {folder.description || "No description added."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <CalendarDays size={14} />

                  <span>
                    Created{" "}
                    {folder.createdAt
                      ? new Date(folder.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Folder Modal */}
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
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Folder size={23} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900">
                        Create New Folder
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Organize your study materials
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeForm}
                    disabled={creating}
                    className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={createFolder} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Folder Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Web Development"
                      required
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a short description..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {creating ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Create Folder
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
