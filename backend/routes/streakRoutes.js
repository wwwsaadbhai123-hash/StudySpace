const express = require("express");
const router = express.Router();

const {
  getStudyStreak,
} = require("../controllers/streakController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getStudyStreak);

module.exports = router; 