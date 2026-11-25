
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "group_join",
        "new_message",
        "note_update",
        "task_reminder",
        "general",
      ],
      default: "general",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
