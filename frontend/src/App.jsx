
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyNotes from "./pages/MyNotes";
import MyFolders from "./pages/MyFolders";
import StudyGroups from "./pages/StudyGroups";
import GroupDetails from "./pages/GroupDetails";
import GroupChat from "./pages/GroupChat";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";
import DailyGoals from "./pages/DailyGoals";
import Pomodoro from "./pages/Pomodoro";
import Achievements from "./pages/Achievements";
import Flashcards from "./pages/Flashcards";
import Quizzes from "./pages/Quizzes";
import Leaderboard from "./pages/Leaderboard";
import StudyChallenges from "./pages/StudyChallenges";
import Resources from "./pages/Resources";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminFeedback from "./pages/AdminFeedback";
import AdminResources from "./pages/AdminResources";
import AdminStudyGroups from "./pages/AdminStudyGroups";
import AdminNotes from "./pages/AdminNotes";
import AdminFolders from "./pages/AdminFolders";
import AdminTasks from "./pages/AdminTasks";
import AdminUserActivity from "./pages/AdminUserActivity";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminNotifications from "./pages/AdminNotifications";
import AdminLoginActivity from "./pages/AdminLoginActivity";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminActiveSessions from "./pages/admin/AdminActiveSessions";  

// Maintenance Screen
function MaintenanceScreen({ message }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">

        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <span className="text-4xl">🛠️</span>
        </div>

        <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
          Under Maintenance
        </p>

        <h1 className="text-3xl font-bold text-white mb-4">
          We'll Be Back Soon!
        </h1>

        <p className="text-slate-300 leading-7 mb-8">
          {message}
        </p>

        <div className="border-t border-slate-800 pt-6">
          <p className="text-slate-400 text-sm">
            Thank you for your patience.
          </p>

          <p className="text-white font-semibold mt-2">
            StudySpace Team
          </p>
        </div>

      </div>
    </div>
  );
}

// Maintenance Event Handler
function MaintenanceHandler({ children }) {
  const { user } = useAuth();
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    const handleMaintenance = (event) => {
      setMaintenanceMessage(
        event.detail?.message ||
        "StudySpace is currently under maintenance. Please try again later."
      );
    };

    window.addEventListener(
      "studyspace-maintenance",
      handleMaintenance
    );

    return () => {
      window.removeEventListener(
        "studyspace-maintenance",
        handleMaintenance
      );
    };
  }, []);

  // Admin can access the platform during maintenance
  if (user?.role === "admin") {
    return children;
  }

  // Show maintenance screen to other users
  if (maintenanceMessage) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MaintenanceHandler>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-notes"
              element={
                <ProtectedRoute>
                  <MyNotes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-folders"
              element={
                <ProtectedRoute>
                  <MyFolders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-groups"
              element={
                <ProtectedRoute>
                  <StudyGroups />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-groups/:id/chat"
              element={
                <ProtectedRoute>
                  <GroupChat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/daily-goals"
              element={
                <ProtectedRoute>
                  <DailyGoals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pomodoro"
              element={
                <ProtectedRoute>
                  <Pomodoro />
                </ProtectedRoute>
              }
            />

            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />

            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <Flashcards />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-challenges"
              element={
                <ProtectedRoute>
                  <StudyChallenges />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />

            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminResources />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/study-groups"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminStudyGroups />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/notes"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminNotes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/folders"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminFolders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminTasks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/user-activity"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUserActivity />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute adminOnly>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/login-activities"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLoginActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

<Route
  path="/admin/active-sessions"
  element={
    <ProtectedRoute adminOnly>
      <AdminActiveSessions />
    </ProtectedRoute>
  }
/>

          </Routes>
        </MaintenanceHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
