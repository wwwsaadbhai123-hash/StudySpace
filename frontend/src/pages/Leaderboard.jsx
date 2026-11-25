
import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Target,
  Clock,
  RefreshCw,
  Award,
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leaderboard");

      setLeaderboard(response.data.leaderboard || []);
      setMyRank(response.data.myRank || null);
    } catch (err) {
      console.error("Leaderboard Error:", err);
      setError(
        err.response?.data?.message || "Unable to load leaderboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const topThree = leaderboard
    .filter((student) => student.rank >= 1 && student.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  const otherStudents = leaderboard.filter(
    (student) => student.rank > 3
  );

  const getInitial = (name) =>
    name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const formatPoints = (points) =>
    Number(points || 0).toLocaleString();

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={22} />;
    if (rank === 2) return <Medal size={22} />;
    if (rank === 3) return <Medal size={22} />;

    return <span className="text-sm font-bold">#{rank}</span>;
  };

  const getRankColors = (rank) => {
    if (rank === 1) {
      return {
        border: "border-yellow-300",
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        avatar: "bg-yellow-100 text-yellow-700",
      };
    }

    if (rank === 2) {
      return {
        border: "border-slate-300",
        bg: "bg-slate-50",
        text: "text-slate-500",
        avatar: "bg-slate-100 text-slate-700",
      };
    }

    if (rank === 3) {
      return {
        border: "border-orange-300",
        bg: "bg-orange-50",
        text: "text-orange-600",
        avatar: "bg-orange-100 text-orange-700",
      };
    }

    return {
      border: "border-gray-100",
      bg: "bg-white",
      text: "text-gray-500",
      avatar: "bg-indigo-100 text-indigo-700",
    };
  };

  const isCurrentUser = (student) =>
    myRank?.userId === student.userId;

  const renderStudent = (student) => {
    const colors = getRankColors(student.rank);
    const isMe = isCurrentUser(student);

    return (
      <div
        key={student.userId}
        className={`flex flex-col gap-4 rounded-2xl border p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
          isMe
            ? "border-indigo-300 bg-indigo-50/70"
            : "border-gray-100 bg-white hover:border-indigo-100"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
          >
            {getRankIcon(student.rank)}
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold ${colors.avatar}`}
          >
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name || "Student"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitial(student.name)
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="max-w-full truncate font-bold text-gray-900">
                {student.name || "Student"}
              </p>

              {isMe && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  YOU
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Rank #{student.rank}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-5">
          <div className="text-center">
            <p className="font-bold text-gray-800">
              {student.completedTasks || 0}
            </p>
            <p className="text-[11px] text-gray-400">Tasks</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-gray-800">
              {student.focusSessions || 0}
            </p>
            <p className="text-[11px] text-gray-400">Sessions</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-gray-800">
              {student.focusMinutes || 0} min
            </p>
            <p className="text-[11px] text-gray-400">Focus Time</p>
          </div>

          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-center">
            <p className="text-lg font-extrabold text-indigo-700">
              {formatPoints(student.points)}
            </p>
            <p className="text-[11px] font-semibold text-indigo-500">
              Points
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto min-w-0 max-w-6xl space-y-7 pb-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <Trophy size={19} />
              <span className="text-xs font-bold tracking-widest">
                STUDYSPACE RANKINGS
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Leaderboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Compete, stay consistent, and celebrate your progress.
            </p>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Rankings
          </button>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 text-white sm:p-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} />
              KEEP PUSHING FORWARD
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Every effort earns you progress.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100">
              Complete your tasks, focus on your goals, and climb the
              StudySpace leaderboard.
            </p>
          </div>

          <Trophy
            size={125}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-5 right-7 hidden text-white/15 sm:block"
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-white/10" />
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* YOUR RANK */}
        {!loading && !error && myRank && (
          <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Award size={29} />
                </div>

                <div>
                  <p className="text-xs font-bold tracking-wider text-indigo-600">
                    YOUR CURRENT POSITION
                  </p>
                  <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                    #{myRank.rank}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep learning and improve your ranking!
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50 px-6 py-4 sm:min-w-44">
                <p className="text-xs font-semibold text-indigo-500">
                  YOUR TOTAL POINTS
                </p>
                <p className="mt-1 text-3xl font-extrabold text-indigo-700">
                  {formatPoints(myRank.points)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
              <Users size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Ranked Students
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? "—" : leaderboard.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-green-50 p-3.5 text-green-600">
              <TrendingUp size={23} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Top Student Points
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {loading
                  ? "—"
                  : formatPoints(leaderboard[0]?.points || 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* HOW POINTS WORK */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">
              How Points Work
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Earn points through your daily productivity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl bg-blue-50/70 p-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Target size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">10 Points</p>
                <p className="text-sm text-gray-500">
                  Per completed task
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-purple-50/70 p-4">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">1 Point</p>
                <p className="text-sm text-gray-500">
                  Per focus minute
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP THREE */}
        <div>
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={21} />
              <h2 className="text-xl font-bold text-gray-900">
                Top Performers
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Celebrating the highest-ranked students.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white py-14 text-center">
              <RefreshCw
                size={26}
                className="mx-auto animate-spin text-indigo-600"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading rankings...
              </p>
            </div>
          ) : !error && topThree.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topThree.map((student) => {
                const first = student.rank === 1;
                const second = student.rank === 2;
                const isMe = isCurrentUser(student);

                return (
                  <div
                    key={student.userId}
                    className={`relative overflow-hidden rounded-2xl border bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      first
                        ? "border-yellow-200 md:-translate-y-2"
                        : second
                        ? "border-slate-200"
                        : "border-orange-200"
                    } ${isMe ? "ring-2 ring-indigo-400" : ""}`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 ${
                        first
                          ? "bg-yellow-400"
                          : second
                          ? "bg-slate-400"
                          : "bg-orange-400"
                      }`}
                    />

                    <div
                      className={`mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl ${
                        first
                          ? "bg-yellow-50 text-yellow-600"
                          : second
                          ? "bg-slate-100 text-slate-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {first ? (
                        <Crown size={30} />
                      ) : (
                        <Medal size={29} />
                      )}
                    </div>

                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                      {first
                        ? "1st Place"
                        : second
                        ? "2nd Place"
                        : "3rd Place"}
                    </p>

                    <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 text-xl font-bold text-indigo-700 shadow-md">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt={student.name || "Student"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitial(student.name)
                      )}
                    </div>

                    <h3 className="mt-3 truncate font-bold text-gray-900">
                      {student.name || "Student"}
                    </h3>

                    {isMe && (
                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        YOU
                      </span>
                    )}

                    <div className="mt-4 rounded-xl bg-gray-50 py-3">
                      <p className="text-2xl font-extrabold text-gray-900">
                        {formatPoints(student.points)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        Total Points
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="font-bold text-gray-800">
                          {student.completedTasks || 0}
                        </p>
                        <p className="text-xs text-gray-400">Tasks</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {student.focusMinutes || 0}
                        </p>
                        <p className="text-xs text-gray-400">Focus Min</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !error ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center">
              <Trophy
                size={35}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-semibold text-gray-800">
                No rankings yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Complete tasks and focus sessions to appear here.
              </p>
            </div>
          ) : null}
        </div>

        {/* ALL STUDENTS */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Award size={21} className="text-indigo-600" />
                  All Rankings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  See how students are performing.
                </p>
              </div>

              {!loading && (
                <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                  {leaderboard.length} Students
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw
                  className="mx-auto animate-spin text-indigo-600"
                  size={26}
                />
                <p className="mt-3 text-sm text-gray-500">
                  Loading leaderboard...
                </p>
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchLeaderboard}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy
                  size={42}
                  className="mx-auto mb-3 text-gray-300"
                />
                <h3 className="font-bold text-gray-800">
                  No Rankings Yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Complete tasks and focus sessions to appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(0,1fr)_90px_90px_110px_110px] gap-3 px-4 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400 sm:grid">
                  <span>Student</span>
                  <span className="text-center">Tasks</span>
                  <span className="text-center">Sessions</span>
                  <span className="text-center">Focus Time</span>
                  <span className="text-center">Points</span>
                </div>

                {leaderboard.map(renderStudent)}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-gray-400">
          <CheckCircle2 size={15} />
          Keep learning. Keep growing. Every minute counts!
        </div>
      </div>
    </AppLayout>
  );
}
