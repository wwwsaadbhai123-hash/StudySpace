const mongoose = require("mongoose");

const dailyGoalSchema = new mongoose.Schema(
  {
    dailyTarget: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 50,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyGoal", dailyGoalSchema);