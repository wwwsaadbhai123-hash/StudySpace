
import { useEffect, useState } from "react";
import {
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Save,
  TrendingUp,
  Trophy,
  CalendarCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function DailyGoals() {
  const [dailyTarget, setDailyTarget] = useState(3);
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [
        goalResponse,
        tasksResponse,
        streakResponse,
      ] = await Promise.all([
        api.get("/daily-goal"),
        api.get("/tasks"),
        api.get("/streak"),
      ]);

      setDailyTarget(goalResponse.data.goal.dailyTarget);
      setStreak(streakResponse.data.currentStreak);
      setBestStreak(streakResponse.data.bestStreak);
      setActiveDays(streakResponse.data.activeDays);

      const tasks = tasksResponse.data.tasks || [];

      const today = new Date();

      const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const completed = tasks.filter((task) => {
        if (
          task.status !== "Completed" ||
          !task.completedAt
        ) {
          return false;
        }

        const completedDate = new Date(task.completedAt);

        if (Number.isNaN(completedDate.getTime())) {
          return false;
        }

        const completedKey = [
          completedDate.getFullYear(),
          String(completedDate.getMonth() + 1).padStart(2, "0"),
          String(completedDate.getDate()).padStart(2, "0"),
        ].join("-");

        return completedKey === todayKey;
      });

      setCompletedToday(completed.length);
    } catch (error) {
      console.error("Daily Goals Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load daily goal data."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, []);

  const saveGoal = async () => {
    if (
      !Number.isInteger(dailyTarget) ||
      dailyTarget < 1 ||
      dailyTarget > 50
    ) {
      setMessage("Please enter a goal between 1 and 50.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("/daily-goal", {
        dailyTarget: Number(dailyTarget),
      });

      setDailyTarget(response.data.goal.dailyTarget);
      setMessage("Daily goal updated successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update daily goal."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const progress =
    dailyTarget > 0
      ? Math.min(
          Math.round((completedToday / dailyTarget) * 100),
          100
        )
      : 0;

  const remainingTasks = Math.max(
    dailyTarget - completedToday,
    0
  );

  const streakCards = [
    {
      title: "Current Streak",
      value: streak,
      suffix: "days",
      icon: Flame,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      title: "Best Streak",
      value: bestStreak,
      suffix: "days",
      icon: Trophy,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      title: "Active Days",
      value: activeDays,
      suffix: "days",
      icon: CalendarCheck,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your daily goals...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <Target size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Daily Goals
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Build a consistent study habit, one day at a time.
              </p>
            </div>
          </div>

          <button
            onClick={fetchGoalData}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Goal and Progress */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Daily Goal Setting */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Target size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Daily Task Goal
                </h2>
                <p className="text-sm text-gray-500">
                  Set your daily target
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tasks you want to complete each day
            </label>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={dailyTarget}
                onChange={(e) => {
                  const value = e.target.value;
                  setDailyTarget(value === "" ? "" : Number(value));
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 pr-20 text-lg font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                Tasks / day
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Choose a number between 1 and 50.
            </p>

            <button
              onClick={saveGoal}
              disabled={
                saving ||
                dailyTarget === "" ||
                !Number.isInteger(dailyTarget) ||
                dailyTarget < 1 ||
                dailyTarget > 50
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving Goal..." : "Save Daily Goal"}
            </button>

            {message && (
              <div
                className={`mt-4 rounded-xl border p-3 text-sm ${
                  messageType === "success"
                    ? "border-green-100 bg-green-50 text-green-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Today's Progress */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Today's Progress
                </h2>
                <p className="text-sm text-gray-500">
                  Your daily achievement
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-4xl font-bold text-gray-900">
                  {completedToday}
                  <span className="text-2xl text-gray-400">
                    {" "}/ {dailyTarget}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Tasks completed today
                </p>
              </div>

              <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {progress}%
                </p>
                <p className="text-xs text-green-600">
                  Completed
                </p>
              </div>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {progress >= 100
                  ? "Daily target achieved!"
                  : `${remainingTasks} more tasks to reach your goal`}
              </span>

              <span className="font-semibold text-green-600">
                {progress}%
              </span>
            </div>

            {progress >= 100 && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                <Trophy size={19} />
                Excellent! You completed today's goal.
              </div>
            )}
          </div>
        </div>

        {/* Streak Section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Flame size={25} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Your Study Streak
              </h2>
              <p className="text-sm text-gray-500">
                Keep your learning consistency alive!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {streakCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${card.bg} ${card.color}`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {card.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {card.suffix}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-orange-50 p-4">
            <Clock className="mt-0.5 shrink-0 text-orange-500" size={20} />

            <p className="text-sm leading-relaxed text-orange-800">
              Complete at least one task each day to maintain your study streak.
              Stay consistent and keep improving!
            </p>
          </div>
        </div>

        {/* Motivation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-sm">
          <div className="relative z-10 flex items-start gap-4">
            <div className="rounded-xl bg-white/15 p-3">
              <Sparkles size={25} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Keep Improving Every Day!
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100">
                Small daily achievements can lead to big results.
                Set your goals, complete your tasks, maintain your streak
                and make every study session count.
              </p>
            </div>
          </div>

          <TrendingUp
            className="absolute -bottom-8 -right-5 text-white/10"
            size={160}
          />
        </div>

      </div>
    </AppLayout>
  );
}
