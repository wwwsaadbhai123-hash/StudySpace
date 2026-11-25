
const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "user",
        "content",
        "settings",
        "notification",
        "security",
        "other",
      ],
      default: "other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ admin: 1, createdAt: -1 });

module.exports = mongoose.model(
  "AdminAuditLog",
  adminAuditLogSchema
);
