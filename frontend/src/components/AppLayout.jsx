
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, FolderOpen, Settings,
  GraduationCap, Sparkles, Bell, CheckCheck, Trash2, X,
  User, ClipboardList, CalendarDays, TrendingUp, Target,
  Timer, Trophy, Layers, Library, MessageSquare, ShieldCheck,
  UserCog, FileText, Folder, Activity, BarChart3, Megaphone,
  ClipboardCheck, Monitor
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const navigationGroups = [
  {
    title: "Workspace",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Academic Tools",
    items: [
      { name: "My Notes", path: "/my-notes", icon: BookOpen },
      { name: "My Folders", path: "/my-folders", icon: FolderOpen },
      { name: "Study Groups", path: "/study-groups", icon: Users },
      { name: "Study Tasks", path: "/tasks", icon: ClipboardList },
      { name: "Calendar", path: "/calendar", icon: CalendarDays },
      { name: "Study Progress", path: "/progress", icon: TrendingUp },
      { name: "Daily Goals", path: "/daily-goals", icon: Target },
      { name: "Pomodoro Timer", path: "/pomodoro", icon: Timer },
      { name: "Achievements", path: "/achievements", icon: Trophy },
      { name: "Flashcards", path: "/flashcards", icon: Layers },
      { name: "Quiz Center", path: "/quizzes", icon: ClipboardList },
      { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
      { name: "Study Challenges", path: "/study-challenges", icon: Sparkles },
      { name: "Resources Library", path: "/resources", icon: Library },
    ],
  },
  {
    title: "Community",
    items: [
      { name: "Feedback & Support", path: "/feedback", icon: MessageSquare },
    ],
  },
];

const adminItems = [
  { name: "Admin Dashboard", path: "/admin", icon: ShieldCheck, end: true },
  { name: "User Management", path: "/admin/users", icon: UserCog },
  { name: "Feedback Management", path: "/admin/feedback", icon: MessageSquare, end: true },
  { name: "Resource Management", path: "/admin/resources", icon: Library },
  { name: "Study Groups", path: "/admin/study-groups", icon: Users },
  { name: "Notes Management", path: "/admin/notes", icon: FileText },
  { name: "Folder Management", path: "/admin/folders", icon: Folder },
  { name: "Tasks Management", path: "/admin/tasks", icon: ClipboardList },
  { name: "Student Activity", path: "/admin/user-activity", icon: Activity },
  { name: "Reports & Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Admin Settings", path: "/admin/settings", icon: Settings },
  { name: "Notifications Management", path: "/admin/notifications", icon: Bell },
  { name: "Security & Login Activity", path: "/admin/login-activities", icon: ShieldCheck },
  { name: "Admin Audit Logs", path: "/admin/audit-logs", icon: ClipboardCheck },
  { name: "Active Sessions", path: "/admin/active-sessions", icon: Monitor },
];

export default function AppLayout({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [platformName, setPlatformName] = useState("StudySpace");
  const [platformDescription, setPlatformDescription] = useState(
    "Your personal collaborative study platform."
  );

  const unreadCount = notifications.filter(item => !item.isRead).length;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Notifications Error:", error);
      }
    };

    const fetchAnnouncement = async () => {
      try {
        const response = await api.get("/admin/announcement");
        setAnnouncement(response.data.announcement || "");
        setPlatformName(response.data.platformName || "StudySpace");
        setPlatformDescription(
          response.data.platformDescription ||
          "Your personal collaborative study platform."
        );
      } catch (error) {
        console.error("Platform Settings Error:", error);
      }
    };

    fetchNotifications();
    fetchAnnouncement();

    const notificationInterval = setInterval(fetchNotifications, 10000);
    const settingsInterval = setInterval(fetchAnnouncement, 30000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(settingsInterval);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(item => item._id === id ? { ...item, isRead: true } : item)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="flex min-h-screen w-full bg-[#f4f6fb]">
      {/* Sidebar */}
      <aside className="z-30 flex w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white max-md:hidden">
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="truncate text-xl font-bold text-slate-900">
            {platformName}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map(group => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              <nav className="flex flex-col gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      className={navLinkClass}
                    >
                      <Icon size={19} className="shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {user?.role === "admin" && (
            <div className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </p>
              <nav className="flex flex-col gap-1">
                {adminItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={navLinkClass}
                    >
                      <Icon size={19} className="shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          <div className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Preferences
            </p>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings size={19} />
              Settings
            </NavLink>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-600 p-4 text-white">
            <Sparkles size={21} />
            <h3 className="mt-3 text-sm font-bold">Study smarter!</h3>
            <p className="mt-1 text-xs leading-5 text-blue-100">
              {platformDescription}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-700">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="font-bold">{userInitial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || "StudySpace Member"}
            </p>
          </div>
          <User size={18} className="shrink-0 text-slate-400" />
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-end border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {userInitial}
              </div>
              <span className="hidden max-w-40 truncate text-sm font-semibold text-slate-800 sm:block">
                {user?.name || "User"}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell size={21} />
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <button
                    aria-label="Close notifications"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-bold text-slate-900">Notifications</h2>
                      <button onClick={() => setShowNotifications(false)} aria-label="Close">
                        <X size={18} />
                      </button>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600"
                      >
                        <CheckCheck size={16} /> Mark all as read
                      </button>
                    )}

                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-500">
                          No notifications yet.
                        </p>
                      ) : notifications.map(item => (
                        <div key={item._id} className={`rounded-xl border p-3 ${item.isRead ? "border-slate-100" : "border-indigo-100 bg-indigo-50"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-800">{item.message}</p>
                              {item.group?.name && (
                                <p className="mt-1 text-xs text-indigo-600">Group: {item.group.name}</p>
                              )}
                              <p className="mt-2 text-xs text-slate-400">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {!item.isRead && (
                                <button onClick={() => markAsRead(item._id)} title="Mark as read" className="p-2 text-indigo-600">
                                  <CheckCheck size={16} />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(item._id)} title="Delete" className="p-2 text-rose-500">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {announcement && (
          <div className="px-4 pt-4 sm:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <Megaphone size={21} className="mt-0.5 shrink-0 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-indigo-900">Platform Announcement</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-indigo-800">{announcement}</p>
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
