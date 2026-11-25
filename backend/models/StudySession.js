
const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    sessionType: {
      type: String,
      enum: ["Focus", "Short Break", "Long Break"],
      default: "Focus",
    },

    completed: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model(
  "StudySession",
  studySessionSchema
);
