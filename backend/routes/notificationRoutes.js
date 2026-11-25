
const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

// Get all notifications
router.get("/", protect, getNotifications);

// Mark all notifications as read
router.patch("/read-all", protect, markAllAsRead);

// Mark single notification as read
router.patch("/:id/read", protect, markAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;
