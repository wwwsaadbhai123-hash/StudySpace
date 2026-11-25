
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");
const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  try {
    const [taskStats, focusStats] = await Promise.all([
      Task.aggregate([
        {
          $match: {
            status: "Completed",
          },
        },
        {
          $group: {
            _id: "$user",
            completedTasks: { $sum: 1 },
          },
        },
      ]),

      StudySession.aggregate([
        {
          $match: {
            sessionType: "Focus",
            completed: true,
          },
        },
        {
          $group: {
            _id: "$user",
            focusSessions: { $sum: 1 },
            focusMinutes: { $sum: "$duration" },
          },
        },
      ]),
    ]);

    const userStats = new Map();

    taskStats.forEach((item) => {
      const userId = item._id.toString();

      userStats.set(userId, {
        completedTasks: item.completedTasks,
        focusSessions: 0,
        focusMinutes: 0,
      });
    });

    focusStats.forEach((item) => {
      const userId = item._id.toString();

      const existing = userStats.get(userId) || {
        completedTasks: 0,
        focusSessions: 0,
        focusMinutes: 0,
      };

      userStats.set(userId, {
        ...existing,
        focusSessions: item.focusSessions,
        focusMinutes: item.focusMinutes,
      });
    });

    const userIds = [...userStats.keys()];

    const users = await User.find({
      _id: { $in: userIds },
    }).select("name profilePicture");

    const leaderboard = users.map((user) => {
      const stats = userStats.get(user._id.toString());

      const points =
        stats.completedTasks * 10 + stats.focusMinutes;

      return {
        userId: user._id,
        name: user.name,
        profilePicture: user.profilePicture || "",
        completedTasks: stats.completedTasks,
        focusSessions: stats.focusSessions,
        focusMinutes: stats.focusMinutes,
        points,
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);

    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    const myRank =
      rankedLeaderboard.find(
        (item) => item.userId.toString() === req.user._id.toString()
      ) || null;

    return res.status(200).json({
      success: true,
      leaderboard: rankedLeaderboard.slice(0, 50),
      myRank,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load leaderboard.",
    });
  }
};
