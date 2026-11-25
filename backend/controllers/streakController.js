
const Task = require("../models/Task");

exports.getStudyStreak = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      status: "Completed",
      completedAt: { $ne: null },
    }).select("completedAt");

    // Unique completion dates (UTC)
    const dates = [
      ...new Set(
        tasks
          .filter((task) => task.completedAt)
          .map((task) =>
            new Date(task.completedAt).toISOString().slice(0, 10)
          )
      ),
    ].sort();

    const dateSet = new Set(dates);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayKey = today.toISOString().slice(0, 10);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Current streak
    let currentStreak = 0;

    let currentDate = new Date(
      dateSet.has(todayKey) ? todayKey : yesterdayKey
    );

    if (
      dateSet.has(todayKey) ||
      dateSet.has(yesterdayKey)
    ) {
      while (dateSet.has(currentDate.toISOString().slice(0, 10))) {
        currentStreak++;

        currentDate.setUTCDate(
          currentDate.getUTCDate() - 1
        );
      }
    }

    // Best streak
    let bestStreak = 0;
    let runningStreak = 0;
    let previousDate = null;

    for (const date of dates) {
      const currentDate = new Date(date);

      if (previousDate) {
        const difference =
          (currentDate - previousDate) / (1000 * 60 * 60 * 24);

        runningStreak =
          difference === 1 ? runningStreak + 1 : 1;
      } else {
        runningStreak = 1;
      }

      bestStreak = Math.max(bestStreak, runningStreak);
      previousDate = currentDate;
    }

    res.status(200).json({
      success: true,
      currentStreak,
      bestStreak,
      activeDays: dates.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
