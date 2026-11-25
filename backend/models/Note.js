const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    content: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudyGroup",
      },
    ],

    isPinned: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);