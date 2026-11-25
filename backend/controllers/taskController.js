
const Task = require("../models/Task");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      reminderEnabled,
      reminderTime,
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title and due date are required",
      });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      reminderEnabled: reminderEnabled ?? true,
      reminderTime: reminderTime || null,
      completedAt: null,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const {
      title,
      description,
      dueDate,
      priority,
      status,
      reminderEnabled,
      reminderTime,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
      task.reminderSent = false;
    }

    if (priority !== undefined) task.priority = priority;

    // Track task completion date
    if (status !== undefined && status !== task.status) {
      task.status = status;

      if (status === "Completed") {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    if (reminderEnabled !== undefined) {
      task.reminderEnabled = reminderEnabled;
      task.reminderSent = false;
    }

    if (reminderTime !== undefined) {
      task.reminderTime = reminderTime || null;
      task.reminderSent = false;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
