
import { useEffect, useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  ClipboardList,
  CalendarDays,
  Flame,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { jsPDF } from "jspdf";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tasksResponse,
        notesResponse,
        groupsResponse,
        sessionsResponse,
      ] = await Promise.all([
        api.get("/tasks"),
        api.get("/notes"),
        api.get("/groups"),
        api.get("/study-sessions"),
      ]);

      setTasks(tasksResponse.data.tasks || []);
      setNotes(notesResponse.data.notes || []);
      setGroups(groupsResponse.data.groups || []);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (err) {
      console.error("Progress Error:", err);
      setError(
        "Unable to load study progress. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const getDateKey = (date) => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayKey = getDateKey(today);

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      key: getDateKey(date),
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date,
    };
  });

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const pendingTasks = tasks.filter(
    (task) => task.status !== "Completed"
  );

  const totalTasks = tasks.length;
  const totalCompleted = completedTasks.length;
  const totalPending = pendingTasks.length;

  const completionRate =
    totalTasks > 0
      ? Math.round((totalCompleted / totalTasks) * 100)
      : 0;

  const focusSessions = sessions.filter(
    (session) =>
      session.sessionType === "Focus" &&
      session.completed !== false
  );

  const weeklyData = lastSevenDays.map((day) => {
    const dailySessions = focusSessions.filter(
      (session) => getDateKey(session.createdAt) === day.key
    );

    const minutes = dailySessions.reduce(
      (total, session) => total + Number(session.duration || 0),
      0
    );

    return {
      ...day,
      minutes,
      count: dailySessions.length,
    };
  });

  const weeklyFocusMinutes = weeklyData.reduce(
    (total, day) => total + day.minutes,
    0
  );

  const weeklyFocusSessions = weeklyData.reduce(
    (total, day) => total + day.count,
    0
  );

  const productiveDays = weeklyData.filter(
    (day) => day.minutes > 0
  ).length;

  const maxMinutes = Math.max(
    ...weeklyData.map((day) => day.minutes),
    60
  );

  const todayFocusMinutes = focusSessions
    .filter(
      (session) => getDateKey(session.createdAt) === todayKey
    )
    .reduce(
      (total, session) => total + Number(session.duration || 0),
      0
    );

  const formatDuration = (minutes) => {
    const safeMinutes = Math.max(0, Math.floor(minutes));
    const hours = Math.floor(safeMinutes / 60);
    const remainingMinutes = safeMinutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;

    return `${hours}h ${remainingMinutes}m`;
  };

  const downloadReport = () => {
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;

      let y = 20;

      const checkPage = (space = 15) => {
        if (y + space > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      const addLine = () => {
        checkPage();
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 9;
      };

      const addSection = (heading) => {
        checkPage(20);
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(heading, margin, y);
        y += 9;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("StudySpace", margin, y);

      y += 9;

      doc.setFontSize(15);
      doc.text("Study Progress Report", margin, y);

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        margin,
        y
      );

      y += 7;
      addLine();

      addSection("Overall Study Statistics");

      const overallStats = [
        ["Total Tasks", totalTasks],
        ["Completed Tasks", totalCompleted],
        ["Pending Tasks", totalPending],
        ["Task Completion Rate", `${completionRate}%`],
        ["Total Notes", notes.length],
        ["Study Groups", groups.length],
      ];

      overallStats.forEach(([label, value]) => {
        checkPage();
        doc.text(`${label}:`, margin, y);
        doc.text(String(value), pageWidth - margin, y, {
          align: "right",
        });
        y += 7;
      });

      addLine();

      addSection("Weekly Focus Analytics");

      const weeklyStats = [
        ["Focus Sessions", weeklyFocusSessions],
        ["Total Focus Time", formatDuration(weeklyFocusMinutes)],
        ["Productive Days", `${productiveDays} / 7`],
        ["Today's Focus Time", formatDuration(todayFocusMinutes)],
      ];

      weeklyStats.forEach(([label, value]) => {
        checkPage();
        doc.text(`${label}:`, margin, y);
        doc.text(String(value), pageWidth - margin, y, {
          align: "right",
        });
        y += 7;
      });

      addLine();

      addSection("Daily Study Summary");

      weeklyData.forEach((day) => {
        checkPage();

        const dateLabel = day.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const summary =
          `${day.label} (${dateLabel}) - ` +
          `${formatDuration(day.minutes)}, ${day.count} sessions`;

        doc.text(summary, margin, y);
        y += 7;
      });

      addLine();

      addSection("Task Summary");

      if (tasks.length === 0) {
        doc.text("No tasks available.", margin, y);
      } else {
        tasks.forEach((task, index) => {
          const status =
            task.status === "Completed" ? "Completed" : "Pending";

          const title = doc.splitTextToSize(
            `${index + 1}. ${task.title || "Untitled"} - ${status}`,
            pageWidth - margin * 2
          );

          checkPage(title.length * 6 + 4);
          doc.text(title, margin, y);
          y += title.length * 6 + 2;
        });
      }

      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `StudySpace | Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save("StudySpace-Study-Report.pdf");
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Unable to generate PDF report. Please try again.");
    }
  };

  const statCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Tasks",
      value: totalCompleted,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Notes",
      value: notes.length,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Study Groups",
      value: groups.length,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading study progress...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchProgress}
            className="mt-5 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-7 pb-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <TrendingUp size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Study Progress
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track your productivity and study performance.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadReport}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Download size={18} />
            Download PDF Report
          </button>
        </div>

        {/* Weekly Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Weekly Focus Time</p>
                <h3 className="mt-2 text-2xl font-bold text-indigo-700">
                  {formatDuration(weeklyFocusMinutes)}
                </h3>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Focus Sessions</p>
                <h3 className="mt-2 text-2xl font-bold text-green-700">
                  {weeklyFocusSessions}
                </h3>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Productive Days</p>
                <h3 className="mt-2 text-2xl font-bold text-orange-700">
                  {productiveDays}/7
                </h3>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <CalendarDays size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                Weekly Study Analytics
              </h2>
              <p className="text-sm text-gray-500">
                Your focus time during the last 7 days
              </p>
            </div>
          </div>

          <div className="flex h-60 items-end justify-between gap-2 sm:gap-5">
            {weeklyData.map((day) => {
              const height =
                day.minutes > 0
                  ? Math.max((day.minutes / maxMinutes) * 100, 5)
                  : 3;

              return (
                <div
                  key={day.key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="min-h-4 text-center text-[10px] font-medium text-gray-500 sm:text-xs">
                    {day.minutes > 0 ? `${day.minutes}m` : ""}
                  </span>

                  <div className="flex h-40 w-full items-end justify-center">
                    <div
                      className={`w-full max-w-12 rounded-t-lg transition-all duration-500 ${
                        day.minutes > 0
                          ? "bg-indigo-500 hover:bg-indigo-700"
                          : "bg-gray-100"
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${day.minutes} minutes`}
                    />
                  </div>

                  <span className="text-xs font-semibold text-gray-500">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Completion */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-gray-900">
                Task Completion Rate
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your completed tasks compared to all tasks
              </p>
            </div>

            <span className="text-3xl font-bold text-indigo-600">
              {completionRate}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <span className="flex items-center gap-2 font-medium text-green-600">
              <CheckCircle2 size={17} />
              Completed: {totalCompleted}
            </span>

            <span className="flex items-center gap-2 font-medium text-orange-600">
              <Clock size={17} />
              Pending: {totalPending}
            </span>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Flame size={23} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Today's Focus
              </h2>
              <p className="text-sm text-gray-500">
                Time spent in completed focus sessions today
              </p>
            </div>
          </div>

          <h3 className="mt-5 text-3xl font-bold text-gray-900">
            {formatDuration(todayFocusMinutes)}
          </h3>
        </div>

        {/* Report Information */}
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="rounded-lg bg-white p-2 text-indigo-600">
            <FileText size={21} />
          </div>

          <div>
            <h3 className="font-semibold text-indigo-900">
              Your Study Report
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-indigo-700">
              Download your tasks, notes, study groups, weekly focus
              analytics and daily study summary as a PDF report.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default Progress;
