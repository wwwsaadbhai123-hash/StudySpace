
const StudySession = require("../models/StudySession");

// Save a completed study session
exports.createStudySession = async (req, res) => {
  try {
    const { duration, sessionType } = req.body;

    if (
      !duration ||
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid session duration.",
      });
    }

    const allowedTypes = [
      "Focus",
      "Short Break",
      "Long Break",
    ];

    const selectedType = sessionType || "Focus";

    if (!allowedTypes.includes(selectedType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session type.",
      });
    }

    const session = await StudySession.create({
      duration: Number(duration),
      sessionType: selectedType,
      completed: true,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Study session saved successfully.",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's study sessions
exports.getStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const totalSessions = sessions.filter(
      (session) => session.sessionType === "Focus"
    ).length;

    const totalStudyMinutes = sessions
      .filter((session) => session.sessionType === "Focus")
      .reduce((total, session) => total + session.duration, 0);

    res.status(200).json({
      success: true,
      count: sessions.length,
      totalSessions,
      totalStudyMinutes,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
