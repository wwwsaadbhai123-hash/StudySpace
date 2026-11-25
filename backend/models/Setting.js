
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "StudySpace",
      trim: true,
      maxlength: 60,
    },

    platformDescription: {
      type: String,
      default: "Your personal collaborative study platform.",
      trim: true,
      maxlength: 300,
    },

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    announcement: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
