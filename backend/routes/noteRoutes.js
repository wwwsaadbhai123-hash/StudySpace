const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  shareNote,
  unshareNote,
  getTrash,
  restoreNote,
  permanentlyDeleteNote,
    togglePin,
} = require("../controllers/noteController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getNotes)
  .post(createNote);

// Trash routes — inhein /:id routes se pehle rakhein
router.get("/trash", getTrash);
router.patch("/:id/restore", restoreNote);
router.delete("/:id/permanent", permanentlyDeleteNote);

router.post("/:id/share", shareNote);
router.delete("/:id/share", unshareNote);
router.patch("/:id/pin", togglePin);

router.route("/:id")
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;