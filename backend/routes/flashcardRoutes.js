
const express = require("express");
const router = express.Router();

const {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
} = require("../controllers/flashcardController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getFlashcards)
  .post(createFlashcard);

router.route("/:id")
  .put(updateFlashcard)
  .delete(deleteFlashcard);

module.exports = router;
