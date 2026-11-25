const express = require("express");
const router = express.Router();

const {
  getDailyGoal,
  updateDailyGoal,
} = require("../controllers/dailyGoalController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getDailyGoal);
router.put("/", updateDailyGoal);

module.exports = router;