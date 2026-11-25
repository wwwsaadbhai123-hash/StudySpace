
const Task = require("../models/Task");
const Notification = require("../models/Notification");

const checkTaskReminders = async () => {
  try {
    const now = new Date();

    // Find tasks whose reminder time has arrived
    const tasks = await Task.find({
      reminderEnabled: true,
      reminderSent: false,
      status: "Pending",
      reminderTime: {
        $ne: null,
        $lte: now,
      },
    });

    for (const task of tasks) {
      await Notification.create({
        recipient: task.user,
        type: "task_reminder",
        message: `Reminder: "${task.title}" is due soon or needs your attention.`,
      });

      task.reminderSent = true;
      await task.save();
    }

    if (tasks.length > 0) {
      console.log(`${tasks.length} task reminder(s) created.`);
    }
  } catch (error) {
    console.error("Task reminder error:", error.message);
  }
};

module.exports = checkTaskReminders;
