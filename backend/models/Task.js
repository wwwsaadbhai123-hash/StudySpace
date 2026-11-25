
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Reminder settings
    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    reminderTime: {
      type: Date,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
