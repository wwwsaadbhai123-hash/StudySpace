
const express = require("express");
const router = express.Router();

const {
  createStudySession,
  getStudySessions,
} = require("../controllers/studySessionController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getStudySessions)
  .post(createStudySession);

module.exports = router;
