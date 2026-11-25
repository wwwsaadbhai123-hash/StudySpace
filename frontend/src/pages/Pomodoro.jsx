
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Coffee,
  Brain,
  CheckCircle2,
  History,
  Target,
  Timer,
  Sparkles,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

const modes = {
  Focus: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};

export default function Pomodoro() {
  const [mode, setMode] = useState("Focus");
  const [timeLeft, setTimeLeft] = useState(modes.Focus);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudyMinutes: 0,
  });

  const [sessions, setSessions] = useState([]);

  const completionHandled = useRef(false);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/study-sessions");

      setStats({
        totalSessions: response.data.totalSessions || 0,
        totalStudyMinutes: response.data.totalStudyMinutes || 0,
      });

      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Study sessions error:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) return 0;
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return;

    setIsRunning(false);

    if (completionHandled.current) return;

    completionHandled.current = true;

    const finishSession = async () => {
      if (mode === "Focus") {
        try {
          setSaving(true);

          await api.post("/study-sessions", {
            duration: modes.Focus / 60,
            sessionType: "Focus",
          });

          await fetchSessions();

          setMessage(
            "Congratulations! Your focus session is completed and saved."
          );
          setMessageType("success");
        } catch (error) {
          console.error("Session save error:", error);

          setMessage(
            error.response?.data?.message ||
              "Session could not be saved. Please try again."
          );
          setMessageType("error");
        } finally {
          setSaving(false);
        }
      } else {
        setMessage(`${mode} completed! Great job.`);
        setMessageType("success");
      }
    };

    finishSession();
  }, [timeLeft, isRunning, mode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const selectMode = (selectedMode) => {
    setIsRunning(false);
    setMode(selectedMode);
    setTimeLeft(modes[selectedMode]);

    completionHandled.current = false;
    setMessage("");
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode]);

    completionHandled.current = false;
    setMessage("");
  };

  const handleStartPause = () => {
    if (timeLeft === 0 || saving) return;

    setMessage("");
    setIsRunning((previous) => !previous);
  };

  const progress =
    ((modes[mode] - timeLeft) / modes[mode]) * 100;

  const circumference = 2 * Math.PI * 116;

  const modeColors = {
    Focus: {
      button: "bg-blue-600 hover:bg-blue-700",
      ring: "#2563eb",
      light: "bg-blue-50",
      text: "text-blue-600",
    },
    "Short Break": {
      button: "bg-emerald-600 hover:bg-emerald-700",
      ring: "#059669",
      light: "bg-emerald-50",
      text: "text-emerald-600",
    },
    "Long Break": {
      button: "bg-violet-600 hover:bg-violet-700",
      ring: "#7c3aed",
      light: "bg-violet-50",
      text: "text-violet-600",
    },
  };

  const currentColor = modeColors[mode];

  return (
    <AppLayout>
      <div className="space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <Timer size={22} />
              </div>
              <span className="text-sm font-semibold text-blue-600">
                PRODUCTIVITY TOOLS
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Pomodoro Timer
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Focus better, take breaks and achieve your daily goals.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Sparkles size={18} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">
              Stay Productive
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Target size={22} />
              </div>
              <span className="text-xs font-medium text-slate-400">
                ALL TIME
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Focus Sessions
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {stats.totalSessions}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Brain size={22} />
              </div>
              <span className="text-xs font-medium text-slate-400">
                ALL TIME
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Total Study Minutes
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {stats.totalStudyMinutes}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${currentColor.light} ${currentColor.text}`}>
                {mode === "Focus" ? (
                  <Brain size={22} />
                ) : (
                  <Coffee size={22} />
                )}
              </div>
              <span className="text-xs font-medium text-slate-400">
                CURRENT
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Current Mode
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {mode}
            </h2>
          </div>
        </div>

        {/* Main Timer */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-5">

            {/* Timer Area */}
            <div className="px-5 py-9 text-center sm:px-8 lg:col-span-3 lg:py-12">

              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-900">
                  Time to Focus
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose your mode and make every minute count.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="mx-auto mb-9 flex max-w-md flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-2">
                {Object.keys(modes).map((item) => (
                  <button
                    key={item}
                    onClick={() => selectMode(item)}
                    disabled={saving}
                    className={`flex-1 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      mode === item
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    } disabled:opacity-50`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Circular Timer */}
              <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">

                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 256 256"
                >
                  <circle
                    cx="128"
                    cy="128"
                    r="116"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />

                  <circle
                    cx="128"
                    cy="128"
                    r="116"
                    fill="none"
                    stroke={currentColor.ring}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference -
                      (progress / 100) * circumference
                    }
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute inset-3 rounded-full border border-slate-100" />

                <div className="z-10">
                  <p className="text-5xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-6xl">
                    {formatTime(timeLeft)}
                  </p>

                  <p className={`mt-3 text-sm font-semibold ${currentColor.text}`}>
                    {mode.toUpperCase()}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {isRunning
                      ? "Stay focused..."
                      : saving
                      ? "Saving your session..."
                      : "Ready when you are"}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mx-auto mt-7 max-w-xs">
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-400">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: currentColor.ring,
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleStartPause}
                  disabled={timeLeft === 0 || saving}
                  className={`flex min-w-36 items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${currentColor.button}`}
                >
                  {isRunning ? (
                    <Pause size={19} />
                  ) : (
                    <Play size={19} />
                  )}

                  {isRunning ? "Pause" : "Start"}
                </button>

                <button
                  onClick={resetTimer}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              {message && (
                <div
                  className={`mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl p-4 text-sm font-medium ${
                    messageType === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {messageType === "success" && (
                    <CheckCircle2 size={18} />
                  )}
                  {message}
                </div>
              )}

              {saving && (
                <p className="mt-4 text-sm font-medium text-blue-600">
                  Saving your study session...
                </p>
              )}
            </div>

            {/* Timer Information */}
            <div className="flex flex-col justify-center bg-slate-50 px-6 py-8 sm:px-9 lg:col-span-2">
              <div className="mb-7">
                <span className="text-xs font-bold tracking-widest text-blue-600">
                  YOUR ROUTINE
                </span>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  How it works
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Break your study time into focused sessions with short breaks.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Brain size={21} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      Focus Session
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      25 minutes of distraction-free work.
                    </p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-blue-600">
                    25m
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Coffee size={21} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      Short Break
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Relax and refresh your mind.
                    </p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-emerald-600">
                    5m
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Clock size={21} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      Long Break
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Take a longer rest when needed.
                    </p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-violet-600">
                    15m
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles size={18} />
                  <span className="text-sm font-bold">
                    Productivity Tip
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-blue-700">
                  Keep your phone away and focus on one task at a time.
                  Small consistent efforts create big results!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <History size={21} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Study Sessions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track your previous focus sessions.
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {sessions.length} Sessions
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Clock size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No study sessions yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Complete your first focus session to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Brain size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {session.sessionType}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    {session.duration} minutes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
