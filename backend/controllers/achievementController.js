
const Achievement = require("../models/Achievement");
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");

const achievementDefinitions = [
  {
    title: "First Step",
    description: "Complete your first study task.",
    icon: "🥉",
    category: "Tasks",
    requirement: 1,
  },
  {
    title: "Task Master",
    description: "Complete 10 study tasks.",
    icon: "🥈",
    category: "Tasks",
    requirement: 10,
  },
  {
    title: "Productivity Pro",
    description: "Complete 50 study tasks.",
    icon: "🥇",
    category: "Tasks",
    requirement: 50,
  },
  {
    title: "7-Day Streak",
    description: "Build a 7-day study streak.",
    icon: "🔥",
    category: "Streak",
    requirement: 7,
  },
  {
    title: "Focus Champion",
    description: "Complete 10 Pomodoro focus sessions.",
    icon: "🍅",
    category: "Focus",
    requirement: 10,
  },
];

exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    const [completedTasks, focusSessions, achievements] =
      await Promise.all([
        Task.countDocuments({
          user: userId,
          status: "Completed",
        }),
        StudySession.countDocuments({
          user: userId,
          sessionType: "Focus",
          completed: true,
        }),
        Achievement.find({ user: userId }).sort({
          unlockedAt: -1,
        }),
      ]);

    const tasks = await Task.find({
      user: userId,
      status: "Completed",
      completedAt: { $ne: null },
    }).select("completedAt");

    const dateKeys = [
      ...new Set(
        tasks.map((task) => {
          const date = new Date(task.completedAt);

          return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
          ].join("-");
        })
      ),
    ].sort();

    const dateSet = new Set(dateKeys);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, "0"),
      String(yesterday.getDate()).padStart(2, "0"),
    ].join("-");

    let currentStreak = 0;

    if (dateSet.has(todayKey) || dateSet.has(yesterdayKey)) {
      const currentDate = new Date(
        dateSet.has(todayKey) ? today : yesterday
      );

      while (true) {
        const key = [
          currentDate.getFullYear(),
          String(currentDate.getMonth() + 1).padStart(2, "0"),
          String(currentDate.getDate()).padStart(2, "0"),
        ].join("-");

        if (!dateSet.has(key)) break;

        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    const progress = {
      Tasks: completedTasks,
      Streak: currentStreak,
      Focus: focusSessions,
    };

    const unlockedTitles = new Set(
      achievements.map((item) => item.title)
    );

    const newlyUnlocked = [];

    for (const definition of achievementDefinitions) {
      const qualifies =
        progress[definition.category] >= definition.requirement;

      if (qualifies && !unlockedTitles.has(definition.title)) {
        try {
          const achievement = await Achievement.create({
            ...definition,
            user: userId,
            unlockedAt: new Date(),
          });

          newlyUnlocked.push(achievement);
          unlockedTitles.add(definition.title);
        } catch (error) {
          // Ignore duplicate-key errors if two requests run together.
          if (error.code !== 11000) throw error;
        }
      }
    }

    const updatedAchievements = await Achievement.find({
      user: userId,
    }).sort({ unlockedAt: -1 });

    const allAchievements = achievementDefinitions.map(
      (definition) => {
        const unlocked = updatedAchievements.find(
          (item) => item.title === definition.title
        );

        const current = progress[definition.category];

        return {
          ...definition,
          unlocked: Boolean(unlocked),
          unlockedAt: unlocked?.unlockedAt || null,
          current,
          progress: Math.min(
            100,
            Math.round(
              (current / definition.requirement) * 100
            )
          ),
        };
      }
    );

    return res.status(200).json({
      success: true,
      count: updatedAchievements.length,
      achievements: allAchievements,
      newlyUnlocked,
    });
  } catch (error) {
    console.error("Achievement Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
