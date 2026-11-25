
const StudyChallenge = require("../models/StudyChallenge");
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");

const getChallengeProgress = async (challenge) => {
  const { challengeType, startDate, endDate, user, target } = challenge;

  let current = 0;

  if (challengeType === "Tasks") {
    current = await Task.countDocuments({
      user,
      status: "Completed",
      completedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  if (challengeType === "FocusMinutes") {
    const result = await StudySession.aggregate([
      {
        $match: {
          user,
          sessionType: "Focus",
          completed: true,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: "$duration" },
        },
      },
    ]);

    current = result[0]?.totalMinutes || 0;
  }

  if (challengeType === "FocusSessions") {
    current = await StudySession.countDocuments({
      user,
      sessionType: "Focus",
      completed: true,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  return {
    current,
    target,
    percentage: Math.min(
      Math.round((current / target) * 100),
      100
    ),
  };
};

exports.createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      challengeType,
      target,
      startDate,
      endDate,
    } = req.body;

    if (
      !title?.trim() ||
      !["Tasks", "FocusMinutes", "FocusSessions"].includes(challengeType) ||
      !Number.isInteger(Number(target)) ||
      Number(target) < 1 ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid challenge details.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    const challenge = await StudyChallenge.create({
      title,
      description,
      challengeType,
      target: Number(target),
      startDate: start,
      endDate: end,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Study challenge created successfully.",
      challenge,
    });
  } catch (error) {
    console.error("Create Challenge Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create challenge.",
    });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await StudyChallenge.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const results = await Promise.all(
      challenges.map(async (challenge) => {
        const progress = await getChallengeProgress(challenge);

        let status = challenge.status;

        if (progress.current >= progress.target) {
          status = "Completed";
        } else if (new Date() > challenge.endDate) {
          status = "Expired";
        } else {
          status = "Active";
        }

        if (challenge.status !== status) {
          challenge.status = status;
          await challenge.save();
        }

        return {
          ...challenge.toObject(),
          progress: progress.current,
          percentage: progress.percentage,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: results.length,
      challenges: results,
    });
  } catch (error) {
    console.error("Get Challenges Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load challenges.",
    });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await StudyChallenge.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Challenge deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Challenge Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete challenge.",
    });
  }
};
