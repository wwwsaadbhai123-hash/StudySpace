
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserRound,
  CalendarDays,
  LoaderCircle,
  MessageCircle,
  FileText,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [sharedNotes, setSharedNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);

  const [error, setError] = useState("");
  const [notesError, setNotesError] = useState("");

  const fetchGroup = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/groups/${id}`);
      setGroup(response.data.group);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load group details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedNotes = async () => {
    try {
      setNotesLoading(true);
      setNotesError("");

      const response = await api.get(
        `/groups/${id}/shared-notes`
      );

      setSharedNotes(response.data.notes || []);
    } catch (err) {
      setNotesError(
        err.response?.data?.message ||
          "Unable to load shared notes."
      );
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchSharedNotes();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
        <LoaderCircle className="animate-spin" size={22} />
        Loading group details...
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <p className="text-red-500">
          {error || "Group not found."}
        </p>

        <button
          onClick={() => navigate("/study-groups")}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-white"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button
        onClick={() => navigate("/study-groups")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to Study Groups
      </button>

      {/* Group Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Users size={28} />
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          {group.name}
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          {group.description || "No description added."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UserRound size={18} />
              Group Creator
            </div>

            <p className="mt-2 font-semibold text-slate-800">
              {group.createdBy?.name || "Unknown"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={18} />
              Total Members
            </div>

            <p className="mt-2 font-semibold text-slate-800">
              {group.members?.length || 0} Members
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={17} />
          Created{" "}
          {new Date(group.createdAt).toLocaleDateString()}
        </div>

        <button
          onClick={() => navigate(`/study-groups/${id}/chat`)}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <MessageCircle size={19} />
          Open Group Chat
        </button>
      </div>

      {/* Shared Notes */}
      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <FileText size={22} className="text-blue-600" />
              Shared Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Notes shared by members of this study group.
            </p>
          </div>

          <button
            onClick={fetchSharedNotes}
            disabled={notesLoading}
            title="Refresh shared notes"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={notesLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {notesError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {notesError}
          </div>
        )}

        {notesLoading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <LoaderCircle className="animate-spin" size={21} />
            Loading shared notes...
          </div>
        ) : sharedNotes.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
            <FileText
              size={38}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="font-semibold text-slate-800">
              No shared notes yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Group members can share their study notes here.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {sharedNotes.map((note) => (
              <article
                key={note._id}
                className="rounded-xl border border-slate-200 p-5 transition hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-800">
                      {note.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Shared by {note.user?.name || "Unknown User"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {note.content || "No content added."}
                </p>

                {note.folder?.name && (
                  <p className="mt-3 flex items-center gap-2 text-xs font-medium text-purple-600">
                    <FolderOpen size={15} />
                    {note.folder.name}
                  </p>
                )}

                {note.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  Updated{" "}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Group Members */}
      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Group Members
        </h2>

        {group.members?.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {group.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  {member.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    {member.name || "Unknown User"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {member.email || ""}
                  </p>
                </div>

                {String(member._id) ===
                  String(group.createdBy?._id) && (
                  <span className="ml-auto rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    Creator
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No members found.
          </p>
        )}
      </div>
    </div>
  );
}
