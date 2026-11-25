
const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    subject: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 100,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
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

module.exports = mongoose.model("Flashcard", flashcardSchema);
