const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

// Get all messages of a group
router.get("/:groupId", protect, getMessages);

// Send a message to a group
router.post("/:groupId", protect, sendMessage);

module.exports = router;