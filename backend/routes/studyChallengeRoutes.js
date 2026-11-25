
const express = require("express");
const router = express.Router();

const {
  createChallenge,
  getChallenges,
  deleteChallenge,
} = require("../controllers/studyChallengeController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getChallenges)
  .post(createChallenge);

router.delete("/:id", deleteChallenge);

module.exports = router;
