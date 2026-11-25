
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  ListTodo,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDateKey = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const today = getDateKey(new Date());

  const getTasksForDate = (date) =>
    tasks.filter((task) => task.dueDate && getDateKey(task.dueDate) === date);

  const selectedTasks = getTasksForDate(selectedDate);

  const completedTasks = selectedTasks.filter(
    (task) => task.status === "Completed"
  );

  const pendingTasks = selectedTasks.filter(
    (task) => task.status !== "Completed"
  );

  const changeMonth = (amount) => {
    setCurrentMonth(new Date(year, month + amount, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(today);
  };

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600 border-red-100";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "low":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <CalendarDays size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Study Calendar
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Organize your schedule and stay on top of your tasks.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={goToToday}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Today
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {tasks.length}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ListTodo size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <h2 className="mt-2 text-2xl font-bold text-green-600">
                  {tasks.filter((task) => task.status === "Completed").length}
                </h2>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h2 className="mt-2 text-2xl font-bold text-amber-600">
                  {tasks.filter((task) => task.status !== "Completed").length}
                </h2>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

          {/* Month Navigation */}
          <div className="mb-7 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Select a date to view your tasks
              </p>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-bold text-gray-400 sm:text-sm"
                >
                  {day}
                </div>
              )
            )}

            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-16 sm:min-h-24" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const dayTasks = getTasksForDate(date);
              const isSelected = selectedDate === date;
              const isToday = today === date;
              const hasCompleted = dayTasks.some(
                (task) => task.status === "Completed"
              );
              const hasPending = dayTasks.some(
                (task) => task.status !== "Completed"
              );

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex min-h-16 flex-col items-center justify-start rounded-xl border p-1.5 transition sm:min-h-24 sm:p-3 ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
                      : isToday
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-transparent bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-semibold sm:text-base">
                    {day}
                  </span>

                  {dayTasks.length > 0 && (
                    <>
                      <span
                        className={`mt-1 hidden text-xs sm:block ${
                          isSelected ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {dayTasks.length} tasks
                      </span>

                      <div className="mt-1.5 flex items-center gap-1">
                        {hasPending && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-amber-500"
                            }`}
                          />
                        )}
                        {hasCompleted && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected ? "bg-green-200" : "bg-green-500"
                            }`}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {isToday && !isSelected && (
                    <span className="mt-1 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Selected date
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Pending tasks
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Completed tasks
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Selected Schedule
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
            </div>

            <div className="flex gap-2">
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                {pendingTasks.length} Pending
              </span>
              <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                {completedTasks.length} Done
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="mt-3 text-sm text-gray-500">
                Loading your tasks...
              </p>
            </div>
          ) : selectedTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <CalendarDays size={26} />
              </div>
              <h3 className="font-semibold text-gray-800">
                No tasks scheduled
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any tasks for this date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/30 sm:flex-row sm:items-start"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5">
                      {task.status === "Completed" ? (
                        <CheckCircle2 className="text-green-600" size={21} />
                      ) : (
                        <Circle className="text-gray-400" size={21} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className={`break-words font-semibold ${
                        task.status === "Completed"
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-1 break-words text-sm text-gray-500">
                          {task.description}
                        </p>
                      )}

                      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={14} />
                        {new Date(task.dueDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
                      {task.priority || "Normal"}
                    </span>

                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      task.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {task.status === "Completed" ? (
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
