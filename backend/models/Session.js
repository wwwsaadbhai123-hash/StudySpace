
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, revokedAt: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
