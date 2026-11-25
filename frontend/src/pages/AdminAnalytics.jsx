
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";
import jsPDF from "jspdf";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  Users,
  FileText,
  ListTodo,
  CheckCircle,
  UsersRound,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Activity,
  CalendarDays,
  AlertCircle,
  Clock,
} from "lucide-react";

const ranges = [
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 12 Months", value: "12months" },
  { label: "All Time", value: "all" },
];

function formatDate(date) {
  if (!date) return "";

  if (date.length === 7) {
    const [year, month] = date.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString(
      "en-US",
      { month: "short", year: "2-digit" }
    );
  }

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
}

function StatCard({ title, value, icon: Icon, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-400">
          OVERVIEW
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        {Number(value || 0).toLocaleString()}
      </h2>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="h-64 min-w-0 sm:h-72">
        {children}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [range, setRange] = useState("30days");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/analytics", {
        params: { range },
      });

      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const chartData = useMemo(() => {
    if (!analytics?.charts) return [];

    const {
      newUsers = [],
      newNotes = [],
      newGroups = [],
      completedTasks = [],
    } = analytics.charts;

    const dataMap = new Map();

    const addData = (items, key) => {
      items.forEach((item) => {
        if (!dataMap.has(item._id)) {
          dataMap.set(item._id, {
            date: item._id,
            users: 0,
            notes: 0,
            groups: 0,
            completedTasks: 0,
          });
        }

        dataMap.get(item._id)[key] = item.count;
      });
    };

    addData(newUsers, "users");
    addData(newNotes, "notes");
    addData(newGroups, "groups");
    addData(completedTasks, "completedTasks");

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        label: formatDate(item.date),
      }));
  }, [analytics]);

  const downloadPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    const summary = analytics.summary;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("StudySpace - Admin Analytics Report", 18, 22);

    doc.setFontSize(11);
    doc.text(
      `Date Range: ${
        ranges.find((item) => item.value === range)?.label
      }`,
      18,
      32
    );

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      18,
      40
    );

    doc.setDrawColor(200);
    doc.line(18, 46, pageWidth - 18, 46);

    doc.setFontSize(15);
    doc.text("Platform Overview", 18, 58);

    const stats = [
      ["Total Students", summary.totalUsers],
      ["Total Notes", summary.totalNotes],
      ["Total Tasks", summary.totalTasks],
      ["Completed Tasks", summary.totalCompletedTasks],
      ["Total Study Groups", summary.totalGroups],
    ];

    let y = 70;

    doc.setFontSize(11);

    stats.forEach(([label, value]) => {
      doc.text(`${label}: ${value ?? 0}`, 20, y);
      y += 9;
    });

    y += 8;

    doc.setFontSize(15);
    doc.text("Activity Breakdown", 18, y);
    y += 12;

    doc.setFontSize(9);

    chartData.forEach((item) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${item.date} | Users: ${item.users} | Notes: ${item.notes} | Groups: ${item.groups} | Completed Tasks: ${item.completedTasks}`,
        18,
        y
      );

      y += 7;
    });

    doc.save("StudySpace-Admin-Analytics.pdf");
  };

  const summary = analytics?.summary;

  return (
    <AppLayout>
      <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Activity size={17} />
              ADMINISTRATION / ANALYTICS
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor platform growth and student activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={downloadPDF}
              disabled={!analytics || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
                <BarChart3 size={14} />
                PLATFORM INSIGHTS
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Understand your platform growth
              </h2>

              <p className="mt-2 text-sm leading-6 text-indigo-100/80">
                Explore student registrations, notes, tasks and study
                group activity through visual reports.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 md:min-w-52">
              <div className="rounded-xl bg-white/15 p-3">
                <TrendingUp size={25} />
              </div>
              <div>
                <p className="text-sm text-indigo-100">Selected Period</p>
                <p className="mt-1 text-lg font-bold">
                  {ranges.find((item) => item.value === range)?.label}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        {/* Date Range */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={19} className="text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analytics Period
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Select the time range for activity charts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {ranges.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                disabled={loading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  range === item.value
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
            <RefreshCw size={30} className="animate-spin text-indigo-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading analytics...
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Preparing your platform reports
            </p>
          </div>
        ) : analytics ? (
          <>
            {/* Stats */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Platform Overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  These figures represent all-time platform totals.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  title="Total Students"
                  value={summary?.totalUsers}
                  icon={Users}
                  color="blue"
                  description="Registered students"
                />

                <StatCard
                  title="Total Notes"
                  value={summary?.totalNotes}
                  icon={FileText}
                  color="violet"
                  description="Notes created"
                />

                <StatCard
                  title="Total Tasks"
                  value={summary?.totalTasks}
                  icon={ListTodo}
                  color="orange"
                  description="Tasks created"
                />

                <StatCard
                  title="Completed Tasks"
                  value={summary?.totalCompletedTasks}
                  icon={CheckCircle}
                  color="emerald"
                  description="Tasks completed"
                />

                <StatCard
                  title="Study Groups"
                  value={summary?.totalGroups}
                  icon={UsersRound}
                  color="cyan"
                  description="Groups created"
                />
              </div>
            </section>

            {/* Charts */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Activity Reports
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Visual breakdown for the selected period
                </p>
              </div>

              {chartData.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <BarChart3 size={27} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-800">
                    No activity data available
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    There is no chart data for this date range.
                  </p>
                </div>
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  <ChartCard
                    title="Student Growth"
                    subtitle="New student registrations over time"
                    icon={Users}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="users"
                          name="New Students"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard
                    title="Notes Creation"
                    subtitle="New notes created over time"
                    icon={FileText}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="notes"
                          name="New Notes"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={45}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard
                    title="Completed Tasks"
                    subtitle="Tasks completed over time"
                    icon={CheckCircle}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="completedTasks"
                          name="Completed Tasks"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={45}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard
                    title="Study Group Growth"
                    subtitle="New study groups created over time"
                    icon={UsersRound}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="groups"
                          name="New Groups"
                          stroke="#0891b2"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              )}
            </section>

            {/* Report Footer */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Export Analytics Report
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Download platform overview and activity breakdown as PDF.
                  </p>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                disabled={!analytics}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Download size={17} />
                Export PDF
              </button>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
