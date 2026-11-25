
const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "🏆",
    },

    category: {
      type: String,
      enum: ["Tasks", "Streak", "Focus"],
      required: true,
    },

    requirement: {
      type: Number,
      required: true,
      min: 1,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index(
  { user: 1, title: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Achievement",
  achievementSchema
);
