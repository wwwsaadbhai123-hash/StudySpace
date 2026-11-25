
import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
} from "lucide-react";
import AppLayout from "../components/AppLayout";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function StudyTimer() {
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setIsRunning(false);

          if (mode === "focus") {
            setSessions((count) => count + 1);
            setMode("break");
            return BREAK_TIME;
          }

          setMode("focus");
          return FOCUS_TIME;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Study Timer</h1>
          <p className="text-gray-500 mt-2">
            Focus on your studies, one session at a time.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => switchMode("focus")}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
                mode === "focus"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <BookOpen size={18} />
              Focus
            </button>

            <button
              onClick={() => switchMode("break")}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
                mode === "break"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Coffee size={18} />
              Break
            </button>
          </div>

          <div className="text-7xl font-bold tracking-wider my-10">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>

          <p className="text-gray-500 mb-8">
            {mode === "focus"
              ? "Stay focused. You can do it!"
              : "Take a break and relax."}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsRunning((running) => !running)}
              className="px-7 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? "Pause" : "Start"}
            </button>

            <button
              onClick={resetTimer}
              className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold">Completed Focus Sessions</h2>
          <p className="text-3xl font-bold mt-3">{sessions}</p>
          <p className="text-sm text-gray-500 mt-1">
            Sessions completed in this visit
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
