
const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getQuizzes)
  .post(createQuiz);

router.post("/:id/submit", submitQuiz);

router.route("/:id")
  .get(getQuiz)
  .put(updateQuiz)
  .delete(deleteQuiz);

module.exports = router;
