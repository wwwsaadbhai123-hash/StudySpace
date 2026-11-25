
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          options.length === 4 &&
          options.every((option) => option.trim().length > 0),
        message: "Each question must have exactly 4 non-empty options.",
      },
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    subject: {
      type: String,
      default: "General",
      trim: true,
    },

    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "A quiz must contain at least one question.",
      },
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

module.exports = mongoose.model("Quiz", quizSchema);
