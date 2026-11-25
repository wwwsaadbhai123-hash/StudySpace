
const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
  getAdminFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getAdminResources,
  deleteAdminResource,
  getAdminStudyGroups,
  deleteAdminStudyGroup,
  getAdminNotes,
  deleteAdminNote,
  getAdminFolders,
  deleteAdminFolder,
  getAdminTasks,
  deleteAdminTask,
  getAdminUserActivity,
  getAdminAnalytics,
  getAdminSettings,
  updateAdminSettings,
  getPlatformAnnouncement,
  getAdminNotifications,
  deleteAdminNotification,
  getAdminLoginActivities,
  getAdminAuditLogs,
  getAdminActiveSessions,
  terminateAdminSession,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Dashboard
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

// User Management
router.get("/users", protect, adminOnly, getAdminUsers);

router.put(
  "/users/:userId/role",
  protect,
  adminOnly,
  updateUserRole
);

// Feedback Management
router.get("/feedback", protect, adminOnly, getAdminFeedback);

router.put(
  "/feedback/:feedbackId/status",
  protect,
  adminOnly,
  updateFeedbackStatus
);

// Resource Management
router.get("/resources", protect, adminOnly, getAdminResources);

router.delete(
  "/resources/:resourceId",
  protect,
  adminOnly,
  deleteAdminResource
);

// Study Group Management
router.get("/study-groups", protect, adminOnly, getAdminStudyGroups);

router.delete(
  "/study-groups/:groupId",
  protect,
  adminOnly,
  deleteAdminStudyGroup
);

// Notes Management
router.get("/notes", protect, adminOnly, getAdminNotes);

router.delete(
  "/notes/:noteId",
  protect,
  adminOnly,
  deleteAdminNote
);

// Folder Management
router.get("/folders", protect, adminOnly, getAdminFolders);

router.delete(
  "/folders/:folderId",
  protect,
  adminOnly,
  deleteAdminFolder
);

// Task Management
router.get("/tasks", protect, adminOnly, getAdminTasks);

router.delete(
  "/tasks/:taskId",
  protect,
  adminOnly,
  deleteAdminTask
);

// Student Activity Management
router.get(
  "/user-activity",
  protect,
  adminOnly,
  getAdminUserActivity
);

// Admin Reports & Analytics
router.get(
  "/analytics",
  protect,
  adminOnly,
  getAdminAnalytics
);

// Admin Platform Settings
router.get(
  "/settings",
  protect,
  adminOnly,
  getAdminSettings
);

router.put(
  "/settings",
  protect,
  adminOnly,
  updateAdminSettings
);

// Platform Announcement
router.get(
  "/announcement",
  protect,
  getPlatformAnnouncement
);

// Admin Notification Management
router.get(
  "/notifications",
  protect,
  adminOnly,
  getAdminNotifications
);

router.delete(
  "/notifications/:notificationId",
  protect,
  adminOnly,
  deleteAdminNotification
);

// Admin Login & Security Activity
router.get(
  "/login-activities",
  protect,
  adminOnly,
  getAdminLoginActivities
);

// Admin Audit Logs
router.get(
  "/audit-logs",
  protect,
  adminOnly,
  getAdminAuditLogs
);

// Admin Active Session Management
router.get(
  "/active-sessions",
  protect,
  adminOnly,
  getAdminActiveSessions
);

router.delete(
  "/active-sessions/:sessionId",
  protect,
  adminOnly,
  terminateAdminSession
);

module.exports = router;
