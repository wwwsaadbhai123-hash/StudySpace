
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: ["Feedback", "Bug Report", "Feature Request", "Other"],
      default: "Feedback",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
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

module.exports = mongoose.model("Feedback", feedbackSchema);
