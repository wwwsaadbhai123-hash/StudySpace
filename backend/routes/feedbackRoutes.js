
const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getMyFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getMyFeedback)
  .post(createFeedback);

router.delete("/:id", deleteFeedback);

module.exports = router;
