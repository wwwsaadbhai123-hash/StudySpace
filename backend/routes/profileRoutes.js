
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadProfilePicture,
} = require("../controllers/profileController");

router.post(
  "/picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

module.exports = router;
