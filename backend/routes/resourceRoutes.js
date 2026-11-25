
const express = require("express");
const router = express.Router();

const {
  uploadResource,
  getResources,
  deleteResource,
} = require("../controllers/resourceController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/resourceUploadMiddleware");

router.use(protect);

router.route("/")
  .get(getResources)
  .post(upload.single("file"), uploadResource);

router.delete("/:id", deleteResource);

module.exports = router;
