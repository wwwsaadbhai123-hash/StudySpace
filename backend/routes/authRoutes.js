const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getMySessions,
  revokeMySession,
  getMyLoginHistory,
  revokeOtherSessions,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

// Settings APIs
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Active Login Sessions
router.get("/sessions", protect, getMySessions);
router.delete("/sessions/:sessionId", protect, revokeMySession);
router.post("/sessions/revoke-others", protect, revokeOtherSessions);

// Personal Login History
router.get("/login-history", protect, getMyLoginHistory);

module.exports = router;