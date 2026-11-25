
const express = require("express");
const router = express.Router();

const {
  createGroup,
  getGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  getSharedNotes,
} = require("../controllers/studyGroupController");

const protect = require("../middleware/authMiddleware");

// All study groups
router.route("/")
  .get(protect, getGroups)
  .post(protect, createGroup);

// Shared notes of a group
router.get("/:id/shared-notes", protect, getSharedNotes);

// Single group details
router.get("/:id", protect, getGroupDetails);

// Join and leave group
router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);

module.exports = router;
