
const mongoose = require("mongoose");

const studyChallengeSchema = new mongoose.Schema(
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

    challengeType: {
      type: String,
      enum: ["Tasks", "FocusMinutes", "FocusSessions"],
      required: true,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Expired"],
      default: "Active",
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
  "StudyChallenge",
  studyChallengeSchema
);
