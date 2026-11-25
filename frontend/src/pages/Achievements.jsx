
import { useEffect, useState } from "react";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Flame,
  Target,
  Award,
  RefreshCw,
  Sparkles,
  Medal,
  Star,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/achievements");

      setAchievements(response.data.achievements || []);
    } catch (err) {
      console.error("Achievements Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load achievements. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlockedAchievements = achievements.filter(
    (item) => item.unlocked
  );

  const lockedAchievements = achievements.filter(
    (item) => !item.unlocked
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Tasks":
        return Target;
      case "Streak":
        return Flame;
      case "Focus":
        return Award;
      default:
        return Trophy;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Tasks":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Streak":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "Focus":
        return "bg-purple-50 text-purple-600 border-purple-100";
      default:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const progressPercentage =
    achievements.length > 0
      ? Math.round(
          (unlockedAchievements.length / achievements.length) * 100
        )
      : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your achievements...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                <Trophy size={22} />
              </div>

              <span className="text-sm font-semibold text-amber-600">
                YOUR MILESTONES
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Achievements & Badges
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Celebrate your progress and unlock new milestones.
            </p>
          </div>

          <button
            onClick={fetchAchievements}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{error}</p>

            <button
              onClick={fetchAchievements}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Achievement Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-violet-700 p-6 text-white shadow-lg sm:p-8">
              <div className="absolute -right-10 -top-14 h-52 w-52 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/10" />

              <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
                <div className="max-w-lg">
                  <div className="mb-4 flex items-center gap-2 text-blue-100">
                    <Sparkles size={18} />
                    <span className="text-xs font-bold tracking-widest">
                      KEEP GOING
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Every achievement starts with one step!
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Complete tasks, maintain your streak and focus on your
                    goals to unlock more rewards.
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <Trophy size={32} />
                  </div>

                  <div>
                    <p className="text-sm text-blue-100">
                      Badges Collected
                    </p>
                    <p className="text-3xl font-bold">
                      {unlockedAchievements.length}
                      <span className="ml-1 text-base font-medium text-blue-100">
                        / {achievements.length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Trophy size={23} />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    COLLECTION
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Total Badges
                </p>

                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  {achievements.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 size={23} />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    EARNED
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Unlocked
                </p>

                <h2 className="mt-1 text-3xl font-bold text-emerald-600">
                  {unlockedAchievements.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <Lock size={23} />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    TO UNLOCK
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Remaining
                </p>

                <h2 className="mt-1 text-3xl font-bold text-orange-600">
                  {lockedAchievements.length}
                </h2>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Medal size={20} className="text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Achievement Progress
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Your overall badge collection progress.
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 px-4 py-2">
                  <span className="text-xl font-bold text-indigo-600">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
                <span>{unlockedAchievements.length} unlocked</span>
                <span>{achievements.length} total badges</span>
              </div>
            </div>

            {/* Unlocked Achievements */}
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                    <Trophy size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Unlocked Achievements
                    </h2>
                    <p className="text-sm text-slate-500">
                      Badges you have already earned.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {unlockedAchievements.length} Earned
                </span>
              </div>

              {unlockedAchievements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center">
                  <Trophy
                    size={40}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <h3 className="font-semibold text-slate-700">
                    No badges unlocked yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Complete tasks and focus sessions to earn your first badge.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {unlockedAchievements.map((item) => {
                    const CategoryIcon = getCategoryIcon(item.category);

                    return (
                      <div
                        key={item.title}
                        className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 text-3xl shadow-sm transition group-hover:scale-105">
                            {item.icon || "🏆"}
                          </div>

                          <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                            <CheckCircle2 size={20} />
                          </div>
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getCategoryColor(
                              item.category
                            )}`}
                          >
                            <CategoryIcon size={13} />
                            {item.category}
                          </span>

                          <span className="text-xs font-medium text-emerald-600">
                            {formatDate(item.unlockedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Locked Achievements */}
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <Lock size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Locked Achievements
                    </h2>
                    <p className="text-sm text-slate-500">
                      Complete challenges to unlock these badges.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {lockedAchievements.length} Remaining
                </span>
              </div>

              {lockedAchievements.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                  <Star
                    size={38}
                    className="mx-auto mb-3 text-emerald-600"
                  />

                  <h3 className="text-lg font-bold text-emerald-700">
                    Amazing! All badges unlocked!
                  </h3>

                  <p className="mt-2 text-sm text-emerald-600">
                    You have completed every achievement. Keep up the great work!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {lockedAchievements.map((item) => {
                    const CategoryIcon = getCategoryIcon(item.category);

                    const itemProgress = Math.min(
                      100,
                      Math.max(0, Number(item.progress) || 0)
                    );

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl grayscale">
                            {item.icon || "🏆"}
                          </div>

                          <div className="rounded-full bg-slate-100 p-2 text-slate-400">
                            <Lock size={19} />
                          </div>
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-800">
                          {item.title}
                        </h3>

                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-2">
                          <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getCategoryColor(
                              item.category
                            )}`}
                          >
                            <CategoryIcon size={13} />
                            {item.category}
                          </span>

                          <span className="text-xs font-semibold text-slate-500">
                            {item.current}/{item.requirement}
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${itemProgress}%` }}
                          />
                        </div>

                        <p className="mt-2 text-right text-xs font-medium text-slate-400">
                          {itemProgress}% completed
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
