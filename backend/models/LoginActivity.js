
const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    ipAddress: {
      type: String,
      default: "Unknown",
    },

    userAgent: {
      type: String,
      default: "Unknown",
    },

    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

loginActivitySchema.index({ createdAt: -1 });
loginActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
  "LoginActivity",
  loginActivitySchema
);
