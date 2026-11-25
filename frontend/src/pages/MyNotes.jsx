
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileText,
  FolderOpen,
  Share2,
  Users,
  Loader2,
  Download,
  RotateCcw,
  Pin,
  StickyNote,
  SearchX,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

export default function MyNotes() {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [showTrash, setShowTrash] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [sharingGroupId, setSharingGroupId] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    folder: "",
  });

  // Fetch all page data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        notesResponse,
        foldersResponse,
        groupsResponse,
        trashResponse,
      ] = await Promise.all([
        api.get("/notes"),
        api.get("/folders"),
        api.get("/groups"),
        api.get("/notes/trash"),
      ]);

      setNotes(notesResponse.data.notes || []);
      setFolders(foldersResponse.data.folders || []);
      setGroups(groupsResponse.data.groups || []);
      setTrashNotes(trashResponse.data.notes || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Current user's groups
  const currentUserId = user?._id || user?.id;

  const myGroups = groups.filter((group) =>
    group.members?.some((member) => {
      const memberId =
        typeof member === "object" ? member._id || member.id : member;

      return String(memberId) === String(currentUserId);
    })
  );

  // Create note form
  const openCreateForm = () => {
    setEditingId(null);

    setForm({
      title: "",
      content: "",
      tags: "",
      folder:
        selectedFolder === "all" || selectedFolder === "none"
          ? ""
          : selectedFolder,
    });

    setError("");
    setShowForm(true);
  };

  // Edit note form
  const openEditForm = (note) => {
    setEditingId(note._id);

    setForm({
      title: note.title || "",
      content: note.content || "",
      tags: (note.tags || []).join(", "),
      folder: note.folder?._id || note.folder || "",
    });

    setError("");
    setShowForm(true);
  };

  // Save or update note
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    const noteData = {
      title: form.title.trim(),
      content: form.content,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      folder: form.folder || null,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`/notes/${editingId}`, noteData);
      } else {
        await api.post("/notes", noteData);
      }

      setShowForm(false);
      setEditingId(null);

      setForm({
        title: "",
        content: "",
        tags: "",
        folder: "",
      });

      await fetchData();
      setSuccess("Note saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  };

  // Move note to Trash
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Move this note to Trash? You can restore it later."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/notes/${id}`);
      await fetchData();

      setSuccess("Note moved to Trash.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to move note to Trash."
      );
    }
  };

  // Restore note
  const handleRestore = async (id) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/notes/${id}/restore`);
      await fetchData();

      setSuccess("Note restored successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to restore note.");
    }
  };

  // Permanently delete note
  const handlePermanentDelete = async (id) => {
    const confirmed = window.confirm(
      "Permanently delete this note? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/notes/${id}/permanent`);
      await fetchData();

      setSuccess("Note permanently deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to permanently delete note."
      );
    }
  };

  // Pin or unpin note
  const handleTogglePin = async (note) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.patch(`/notes/${note._id}/pin`);

      await fetchData();

      setSuccess(
        response.data.note?.isPinned
          ? "Note pinned successfully."
          : "Note unpinned successfully."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to pin or unpin note.");
    }
  };

  // Escape text for PDF export
  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Export note as PDF using browser print
  const handleExportPdf = (note) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError(
        "PDF export window was blocked. Please allow pop-ups and try again."
      );
      return;
    }

    const title = escapeHtml(note.title || "Untitled Note");
    const content = escapeHtml(note.content || "No content added.");

    const tags = (note.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join(" ");

    const folderName =
      typeof note.folder === "object" ? note.folder?.name : "";

    const updatedDate = note.updatedAt
      ? new Date(note.updatedAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              color: #1e293b;
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.7;
            }

            .document {
              max-width: 800px;
              margin: 0 auto;
            }

            h1 {
              margin: 0 0 12px;
              padding-bottom: 16px;
              border-bottom: 2px solid #e2e8f0;
              font-size: 28px;
              line-height: 1.3;
              overflow-wrap: anywhere;
            }

            .meta {
              margin-bottom: 24px;
              color: #64748b;
              font-size: 12px;
            }

            .tags {
              margin: 16px 0 24px;
            }

            .tag {
              display: inline-block;
              margin: 0 6px 6px 0;
              padding: 3px 10px;
              border-radius: 20px;
              background: #eff6ff;
              color: #1d4ed8;
              font-size: 12px;
            }

            .content {
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              font-size: 14px;
            }

            .footer {
              margin-top: 40px;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
              color: #94a3b8;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 0;
              }

              .document {
                max-width: none;
              }

              .tag {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <main class="document">
            <h1>${title}</h1>

            <div class="meta">
              ${folderName ? `Folder: ${escapeHtml(folderName)} · ` : ""}
              Updated: ${escapeHtml(updatedDate)}
            </div>

            ${tags ? `<div class="tags">${tags}</div>` : ""}

            <div class="content">${content}</div>

            <div class="footer">Exported from StudySpace</div>
          </main>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    setError("");
    setSuccess(
      "PDF export opened. Choose Save as PDF in the print dialog."
    );
  };

  // Open share modal
  const openShareModal = (note) => {
    setSelectedNote(note);
    setShowShareModal(true);
    setError("");
    setSuccess("");
  };

  // Share note with group
  const handleShare = async (groupId) => {
    if (!selectedNote) return;

    try {
      setSharingGroupId(groupId);
      setError("");
      setSuccess("");

      await api.post(`/notes/${selectedNote._id}/share`, {
        groupId,
      });

      await fetchData();

      setSelectedNote((current) => {
        if (!current) return null;

        const group = myGroups.find(
          (item) => String(item._id) === String(groupId)
        );

        return {
          ...current,
          sharedWith: [
            ...(current.sharedWith || []),
            group,
          ].filter(Boolean),
        };
      });

      setSuccess("Note shared with group successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to share note.");
    } finally {
      setSharingGroupId("");
    }
  };

  // Unshare note from group
  const handleUnshare = async (groupId) => {
    if (!selectedNote) return;

    try {
      setSharingGroupId(groupId);
      setError("");
      setSuccess("");

      await api.delete(`/notes/${selectedNote._id}/share`, {
        data: { groupId },
      });

      await fetchData();

      setSelectedNote((current) => {
        if (!current) return null;

        return {
          ...current,
          sharedWith: (current.sharedWith || []).filter(
            (group) =>
              String(group._id || group) !== String(groupId)
          ),
        };
      });

      setSuccess("Note unshared successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to unshare note.");
    } finally {
      setSharingGroupId("");
    }
  };

  // Search and folder filtering
  const filteredNotes = notes.filter((note) => {
    const text = `${note.title || ""} ${note.content || ""} ${(note.tags || []).join(" ")}`;

    const matchesSearch = text
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const noteFolderId = String(
      note.folder?._id || note.folder || ""
    );

    const matchesFolder =
      selectedFolder === "all" ||
      (selectedFolder === "none" && !noteFolderId) ||
      noteFolderId === String(selectedFolder);

    return matchesSearch && matchesFolder;
  });

  // Pinned notes appear first
  const displayedNotes = (
    showTrash ? trashNotes : filteredNotes
  ).slice().sort((a, b) => {
    if (showTrash) return 0;
    return Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
  });

  const isSharedWith = (note, groupId) =>
    note.sharedWith?.some(
      (group) => String(group._id || group) === String(groupId)
    );

  return (
    <AppLayout>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8 flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <StickyNote size={16} />
              YOUR WORKSPACE
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Notes
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Create, organize, manage and share your study notes.
            </p>
          </div>

          {!showTrash && (
            <button
              onClick={openCreateForm}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <Plus size={19} />
              Create New Note
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="min-w-0 break-words">{error}</span>
            <button
              onClick={() => setError("")}
              className="shrink-0 rounded-md p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <span className="min-w-0 break-words">{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="shrink-0 rounded-md p-1 hover:bg-green-100"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setShowTrash(false);
              setError("");
              setSuccess("");
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              !showTrash
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            My Notes ({notes.length})
          </button>

          <button
            onClick={() => {
              setShowTrash(true);
              setError("");
              setSuccess("");
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              showTrash
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Trash2 size={16} />
            Trash ({trashNotes.length})
          </button>
        </div>

        {/* Folder Filters */}
        {!showTrash && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FolderOpen size={17} />
              Filter by folder
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFolder("all")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedFolder === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Notes
              </button>

              <button
                onClick={() => setSelectedFolder("none")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedFolder === "none"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Unorganized
              </button>

              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => setSelectedFolder(folder._id)}
                  className={`inline-flex max-w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    String(selectedFolder) === String(folder._id)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <FolderOpen size={15} className="shrink-0" />
                  <span className="break-all">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {!showTrash && (
          <div className="mb-6 flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={20} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, content or tags..."
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
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
            <Loader2 size={32} className="mb-3 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500">
              Loading {showTrash ? "Trash" : "your notes"}...
            </p>
          </div>
        ) : displayedNotes.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm sm:px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              {showTrash ? (
                <Trash2 size={30} className="text-slate-400" />
              ) : search || selectedFolder !== "all" ? (
                <SearchX size={30} className="text-blue-500" />
              ) : (
                <FileText size={30} className="text-blue-500" />
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              {showTrash
                ? "Trash is empty"
                : search || selectedFolder !== "all"
                  ? "No matching notes found"
                  : "No notes yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {showTrash
                ? "Notes you move to Trash will appear here. You can restore or permanently delete them."
                : search || selectedFolder !== "all"
                  ? "Try another search term or select a different folder."
                  : "Start organizing your studies by creating your first note."}
            </p>

            {!showTrash && !search && selectedFolder === "all" && (
              <button
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Notes count */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700">
                {showTrash ? "Deleted Notes" : "Your Notes"}
              </p>

              <p className="text-xs text-slate-500">
                {displayedNotes.length}{" "}
                {displayedNotes.length === 1 ? "note" : "notes"} found
              </p>
            </div>

            {/* Notes Grid */}
            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedNotes.map((note) => (
                <article
                  key={note._id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  {/* Card Header */}
                  <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words text-base font-bold leading-6 text-slate-800">
                          {note.title || "Untitled Note"}
                        </h2>

                        {note.isPinned && !showTrash && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Pin size={12} />
                            Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    {!showTrash && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(note)}
                          title={note.isPinned ? "Unpin note" : "Pin note"}
                          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                          className={`rounded-lg p-2 transition ${
                            note.isPinned
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          }`}
                        >
                          <Pin size={17} />
                        </button>

                        <button
                          onClick={() => openEditForm(note)}
                          title="Edit note"
                          aria-label="Edit note"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(note._id)}
                          title="Move to Trash"
                          aria-label="Move to Trash"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Note Content */}
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {note.content || "No content added."}
                  </p>

                  {/* Folder */}
                  {note.folder && (
                    <div className="mt-4 flex min-w-0 items-center gap-2 text-xs font-semibold text-purple-600">
                      <FolderOpen size={15} className="shrink-0" />
                      <span className="break-words">
                        {note.folder.name || "Folder"}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="max-w-full break-all rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Shared Groups */}
                  {note.sharedWith?.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700">
                      <Users size={15} className="shrink-0" />
                      Shared with {note.sharedWith.length} group(s)
                    </div>
                  )}

                  {/* Card Actions */}
                  {showTrash ? (
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => handleRestore(note._id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(note._id)}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete Forever
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-col gap-2">
                      <button
                        onClick={() => handleExportPdf(note)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>

                      <button
                        onClick={() => openShareModal(note)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Share2 size={16} />
                        Share with Study Group
                      </button>
                    </div>
                  )}

                  {/* Date */}
                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    {showTrash && note.deletedAt
                      ? `Deleted ${new Date(note.deletedAt).toLocaleDateString()}`
                      : `Updated ${
                          note.updatedAt
                            ? new Date(note.updatedAt).toLocaleDateString()
                            : "recently"
                        }`}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Create / Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
            <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId ? "Edit Note" : "Create New Note"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Add your study information below.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-h-[calc(100vh-130px)] space-y-4 overflow-y-auto p-5 sm:p-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Note Title
                  </label>

                  <input
                    type="text"
                    maxLength={120}
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. JavaScript Basics"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Content
                  </label>

                  <textarea
                    rows={7}
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder="Write your study notes here..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tags
                  </label>

                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value })
                    }
                    placeholder="HTML, CSS, JavaScript"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Separate tags with commas.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Folder
                  </label>

                  <select
                    value={form.folder}
                    onChange={(e) =>
                      setForm({ ...form, folder: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">No Folder (Unorganized)</option>

                    {folders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && <Loader2 size={17} className="animate-spin" />}
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Note"
                        : "Save Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Notes Modal */}
        {showShareModal && selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
            <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">
                    Share Note
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedNote.title}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedNote(null);
                  }}
                  className="ml-3 shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close share dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <p className="mb-4 text-sm text-slate-600">
                  Select a study group to share this note with.
                </p>

                {myGroups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <Users
                      size={35}
                      className="mx-auto mb-3 text-slate-400"
                    />

                    <p className="font-semibold text-slate-700">
                      No study groups available
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Join or create a study group first.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 space-y-3 overflow-y-auto">
                    {myGroups.map((group) => {
                      const alreadyShared = isSharedWith(
                        selectedNote,
                        group._id
                      );

                      const isProcessing =
                        sharingGroupId === group._id;

                      return (
                        <div
                          key={group._id}
                          className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 sm:p-4"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-800">
                              {group.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {group.members?.length || 0} members
                            </p>
                          </div>

                          <button
                            disabled={Boolean(sharingGroupId)}
                            onClick={() =>
                              alreadyShared
                                ? handleUnshare(group._id)
                                : handleShare(group._id)
                            }
                            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                              alreadyShared
                                ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : alreadyShared ? (
                              <>
                                <X size={16} />
                                Unshare
                              </>
                            ) : (
                              <>
                                <Share2 size={16} />
                                Share
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setSelectedNote(null);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
