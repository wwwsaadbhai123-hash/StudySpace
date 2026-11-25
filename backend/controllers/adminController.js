
const User = require("../models/User");
const Note = require("../models/Note");
const StudyGroup = require("../models/StudyGroup");
const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");
const Feedback = require("../models/Feedback");
const Folder = require("../models/Folder");
const Task = require("../models/Task");
const Setting = require("../models/Setting");
const Notification = require("../models/Notification");
const LoginActivity = require("../models/LoginActivity");
const AdminAuditLog = require("../models/AdminAuditLog");
const Session = require("../models/Session");

// ==========================================================
// ADMIN AUDIT LOG HELPER
// ==========================================================

const createAdminAuditLog = async (
  req,
  { action, category, description, targetId = "" }
) => {
  try {
    if (!req.user?._id) {
      console.error("Audit log skipped: Admin user not found.");
      return;
    }

    await AdminAuditLog.create({
      admin: req.user._id,
      action,
      category,
      description,
      targetId,
      ipAddress: req.ip || "Unknown",
    });
  } catch (error) {
    console.error("Create Admin Audit Log Error:", error);
  }
};

// ==========================================================
// ADMIN DASHBOARD
// ==========================================================

exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalStudents,
      totalNotes,
      totalGroups,
      totalResources,
      totalFeedback,
      pendingFeedback,
      bugReports,
      recentUsers,
      recentFeedback,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "student" }),
      Note.countDocuments(),
      StudyGroup.countDocuments(),
      Resource.countDocuments(),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: "Pending" }),
      Feedback.countDocuments({ type: "Bug Report" }),
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
      Feedback.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalStudents,
        totalNotes,
        totalGroups,
        totalResources,
        totalFeedback,
        pendingFeedback,
        bugReports,
      },
      recentUsers,
      recentFeedback,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard.",
    });
  }
};

// ==========================================================
// ADMIN USER MANAGEMENT
// ==========================================================

exports.getAdminUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("name email role profilePicture createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const previousRole = user.role;

    user.role = role;
    await user.save();

    await createAdminAuditLog(req, {
      action: "UPDATE_USER_ROLE",
      category: "user",
      description: `Changed ${user.name}'s role from ${previousRole} to ${role}.`,
      targetId: user._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user role.",
    });
  }
};

// ==========================================================
// ADMIN FEEDBACK MANAGEMENT
// ==========================================================

exports.getAdminFeedback = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    if (search?.trim()) {
      filter.$or = [
        { subject: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const feedback = await Feedback.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Admin Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch feedback.",
    });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { feedbackId } = req.params;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback status.",
      });
    }

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    const previousStatus = feedback.status;

    feedback.status = status;
    await feedback.save();

    await createAdminAuditLog(req, {
      action: "UPDATE_FEEDBACK_STATUS",
      category: "other",
      description: `Changed feedback status from ${previousStatus} to ${status}.`,
      targetId: feedback._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Feedback status updated successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Update Feedback Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update feedback status.",
    });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    await createAdminAuditLog(req, {
      action: "DELETE_FEEDBACK",
      category: "other",
      description: "Admin deleted a feedback submission.",
      targetId: feedback._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete feedback.",
    });
  }
};

// ==========================================================
// ADMIN RESOURCE MANAGEMENT
// ==========================================================

exports.getAdminResources = async (req, res) => {
  try {
    const { search, subject } = req.query;

    const filter = {};

    if (subject?.trim()) {
      filter.subject = subject.trim();
    }

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { originalName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Admin Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch resources.",
    });
  }
};

exports.deleteAdminResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    await cloudinary.uploader.destroy(
      resource.publicId,
      { resource_type: "raw" }
    );

    await resource.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_RESOURCE",
      category: "content",
      description: `Admin deleted resource: ${resource.title || resource.originalName || "Untitled"}.`,
      targetId: resource._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Delete Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete resource.",
    });
  }
};

// ==========================================================
// ADMIN STUDY GROUP MANAGEMENT
// ==========================================================

exports.getAdminStudyGroups = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const groups = await StudyGroup.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: groups.length,
      groups,
    });
  } catch (error) {
    console.error("Admin Study Groups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch study groups.",
    });
  }
};

exports.deleteAdminStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found.",
      });
    }

    await group.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_STUDY_GROUP",
      category: "content",
      description: `Admin deleted study group: ${group.name}.`,
      targetId: group._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Study group deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Delete Study Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete study group.",
    });
  }
};

// ==========================================================
// ADMIN NOTE MANAGEMENT
// ==========================================================

exports.getAdminNotes = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
        { tags: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const notes = await Note.find(filter)
      .populate("user", "name email")
      .populate("folder", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Admin Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notes.",
    });
  }
};

exports.deleteAdminNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await note.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_NOTE",
      category: "content",
      description: `Admin deleted note: ${note.title}.`,
      targetId: note._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Delete Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete note.",
    });
  }
};

// ==========================================================
// ADMIN FOLDER MANAGEMENT
// ==========================================================

exports.getAdminFolders = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const folders = await Folder.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: folders.length,
      folders,
    });
  } catch (error) {
    console.error("Admin Folders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch folders.",
    });
  }
};

exports.deleteAdminFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    await folder.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_FOLDER",
      category: "content",
      description: `Admin deleted folder: ${folder.name}.`,
      targetId: folder._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Folder deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Delete Folder Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete folder.",
    });
  }
};

// ==========================================================
// ADMIN TASK MANAGEMENT
// ==========================================================

exports.getAdminTasks = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (["Pending", "Completed"].includes(status)) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Admin Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tasks.",
    });
  }
};

exports.deleteAdminTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await task.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_TASK",
      category: "content",
      description: `Admin deleted task: ${task.title}.`,
      targetId: task._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete task.",
    });
  }
};

// ==========================================================
// ADMIN STUDENT ACTIVITY
// ==========================================================

exports.getAdminUserActivity = async (req, res) => {
  try {
    const [
      students,
      notesActivity,
      tasksActivity,
      joinedGroupsActivity,
      createdGroupsActivity,
    ] = await Promise.all([
      User.find({ role: "student" })
        .select("name email profilePicture createdAt")
        .sort({ createdAt: -1 }),

      Note.aggregate([
        {
          $group: {
            _id: "$user",
            totalNotes: { $sum: 1 },
          },
        },
      ]),

      Task.aggregate([
        {
          $group: {
            _id: "$user",
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
              },
            },
            pendingTasks: {
              $sum: {
                $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
              },
            },
          },
        },
      ]),

      StudyGroup.aggregate([
        { $unwind: "$members" },
        {
          $group: {
            _id: "$members",
            joinedGroups: { $sum: 1 },
          },
        },
      ]),

      StudyGroup.aggregate([
        {
          $group: {
            _id: "$createdBy",
            createdGroups: { $sum: 1 },
          },
        },
      ]),
    ]);

    const notesMap = new Map(
      notesActivity.map((item) => [
        item._id.toString(),
        item.totalNotes,
      ])
    );

    const tasksMap = new Map(
      tasksActivity.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    const joinedGroupsMap = new Map(
      joinedGroupsActivity.map((item) => [
        item._id.toString(),
        item.joinedGroups,
      ])
    );

    const createdGroupsMap = new Map(
      createdGroupsActivity.map((item) => [
        item._id.toString(),
        item.createdGroups,
      ])
    );

    const activity = students.map((student) => {
      const studentId = student._id.toString();
      const taskData = tasksMap.get(studentId);

      return {
        ...student.toObject(),
        totalNotes: notesMap.get(studentId) || 0,
        totalTasks: taskData?.totalTasks || 0,
        completedTasks: taskData?.completedTasks || 0,
        pendingTasks: taskData?.pendingTasks || 0,
        joinedGroups: joinedGroupsMap.get(studentId) || 0,
        createdGroups: createdGroupsMap.get(studentId) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      totalStudents: activity.length,
      activity,
    });
  } catch (error) {
    console.error("Admin User Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student activity.",
    });
  }
};

// ==========================================================
// ADMIN REPORTS & ANALYTICS
// ==========================================================

exports.getAdminAnalytics = async (req, res) => {
  try {
    const { range = "30days" } = req.query;

    const allowedRanges = [
      "7days",
      "30days",
      "12months",
      "all",
    ];

    if (!allowedRanges.includes(range)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analytics date range.",
      });
    }

    const now = new Date();
    let startDate = null;
    let groupFormat = "%Y-%m-%d";

    if (range === "7days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
    } else if (range === "30days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
    } else if (range === "12months") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      groupFormat = "%Y-%m";
    }

    const dateFilter = startDate
      ? { $gte: startDate, $lte: now }
      : { $lte: now };

    const [
      totalUsers,
      totalNotes,
      totalTasks,
      totalCompletedTasks,
      totalGroups,
      newUsers,
      newNotes,
      newGroups,
      completedTasks,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Note.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: "Completed" }),
      StudyGroup.countDocuments(),

      User.aggregate([
        { $match: { role: "student", createdAt: dateFilter } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Note.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      StudyGroup.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Task.aggregate([
        {
          $match: {
            status: "Completed",
            completedAt: dateFilter,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$completedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      range,
      summary: {
        totalUsers,
        totalNotes,
        totalTasks,
        totalCompletedTasks,
        totalGroups,
      },
      charts: {
        newUsers,
        newNotes,
        newGroups,
        completedTasks,
      },
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load analytics.",
    });
  }
};

// ==========================================================
// ADMIN PLATFORM SETTINGS
// ==========================================================

exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Admin Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load platform settings.",
    });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const {
      platformName,
      platformDescription,
      allowRegistration,
      maintenanceMode,
      announcement,
    } = req.body;

    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting({});
    }

    if (platformName !== undefined) {
      settings.platformName = platformName;
    }

    if (platformDescription !== undefined) {
      settings.platformDescription = platformDescription;
    }

    if (allowRegistration !== undefined) {
      settings.allowRegistration = allowRegistration;
    }

    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = maintenanceMode;
    }

    if (announcement !== undefined) {
      settings.announcement = announcement;
    }

    await settings.save();

    await createAdminAuditLog(req, {
      action: "UPDATE_PLATFORM_SETTINGS",
      category: "settings",
      description: "Admin updated platform settings.",
      targetId: settings._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Platform settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update Admin Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update platform settings.",
    });
  }
};

exports.getPlatformAnnouncement = async (req, res) => {
  try {
    const settings = await Setting.findOne().select(
      "announcement platformName platformDescription"
    );

    return res.status(200).json({
      success: true,
      announcement: settings?.announcement || "",
      platformName: settings?.platformName || "StudySpace",
      platformDescription:
        settings?.platformDescription ||
        "Your personal collaborative study platform.",
    });
  } catch (error) {
    console.error("Get Platform Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load platform settings.",
    });
  }
};

// ==========================================================
// ADMIN NOTIFICATION MANAGEMENT
// ==========================================================

exports.getAdminNotifications = async (req, res) => {
  try {
    const { search = "", type = "", status = "" } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (status === "read") {
      query.isRead = true;
    } else if (status === "unread") {
      query.isRead = false;
    }

    let notifications = await Notification.find(query)
      .populate("recipient", "name email")
      .populate("sender", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 });

    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      notifications = notifications.filter((notification) => {
        return (
          notification.message?.toLowerCase().includes(searchText) ||
          notification.recipient?.name?.toLowerCase().includes(searchText) ||
          notification.recipient?.email?.toLowerCase().includes(searchText) ||
          notification.sender?.name?.toLowerCase().includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      total: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Admin Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notifications.",
    });
  }
};

exports.deleteAdminNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.notificationId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await notification.deleteOne();

    await createAdminAuditLog(req, {
      action: "DELETE_NOTIFICATION",
      category: "notification",
      description: "Admin deleted a platform notification.",
      targetId: notification._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Admin Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete notification.",
    });
  }
};

// ==========================================================
// ADMIN LOGIN & SECURITY ACTIVITY
// ==========================================================

exports.getAdminLoginActivities = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const filter = {};

    if (["success", "failed"].includes(status)) {
      filter.status = status;
    }

    if (search.trim()) {
      filter.$or = [
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          ipAddress: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const [
      activities,
      totalActivities,
      successfulLogins,
      failedLogins,
    ] = await Promise.all([
      LoginActivity.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(100),

      LoginActivity.countDocuments(filter),

      LoginActivity.countDocuments({ status: "success" }),

      LoginActivity.countDocuments({ status: "failed" }),
    ]);

    return res.status(200).json({
      success: true,
      total: totalActivities,
      successfulLogins,
      failedLogins,
      activities,
    });
  } catch (error) {
    console.error("Admin Login Activities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch login activities.",
    });
  }
};

// ==========================================================
// ADMIN AUDIT LOGS
// ==========================================================

exports.getAdminAuditLogs = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const filter = {};

    if (
      [
        "user",
        "content",
        "settings",
        "notification",
        "security",
        "other",
      ].includes(category)
    ) {
      filter.category = category;
    }

    if (search.trim()) {
      filter.$or = [
        { action: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(filter)
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .limit(100),

      AdminAuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      logs,
    });
  } catch (error) {
    console.error("Admin Audit Logs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin audit logs.",
    });
  }
};

// ==========================================================
// ADMIN ACTIVE SESSION MANAGEMENT
// ==========================================================

// GET ALL ACTIVE SESSIONS
exports.getAdminActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name email role profilePicture")
      .sort({ lastActiveAt: -1 });

    const activeSessions = sessions
      .filter((session) => session.user)
      .map((session) => ({
        _id: session._id,
        sessionId: session.sessionId,
        user: session.user,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      }));

    return res.status(200).json({
      success: true,
      total: activeSessions.length,
      sessions: activeSessions,
    });
  } catch (error) {
    console.error("Admin Active Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch active sessions.",
    });
  }
};

// TERMINATE A USER SESSION
exports.terminateAdminSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate("user", "name email");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Active session not found.",
      });
    }

    session.revokedAt = new Date();
    await session.save();

    await createAdminAuditLog(req, {
      action: "TERMINATE_USER_SESSION",
      category: "security",
      description: `Admin terminated an active session belonging to ${
        session.user?.email || "a user"
      }.`,
      targetId: session._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "User session terminated successfully.",
    });
  } catch (error) {
    console.error("Terminate Admin Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to terminate user session.",
    });
  }
};