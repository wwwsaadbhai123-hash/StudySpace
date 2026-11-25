
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");

// CREATE QUIZ
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, subject, questions } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one question",
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      questions,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL QUIZZES
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE QUIZ
exports.getQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE QUIZ
exports.updateQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const { title, description, subject, questions } = req.body;

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (subject !== undefined) quiz.subject = subject;
    if (questions !== undefined) quiz.questions = questions;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE QUIZ
exports.deleteQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUBMIT QUIZ
exports.submitQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Please answer every question",
      });
    }

    let score = 0;

    const results = quiz.questions.map((question) => {
      const submittedAnswer = answers.find(
        (answer) =>
          String(answer.questionId) === String(question._id)
      );

      const selectedOption = submittedAnswer?.selectedOption;

      const isCorrect =
        Number.isInteger(selectedOption) &&
        selectedOption >= 0 &&
        selectedOption <= 3 &&
        selectedOption === question.correctAnswer;

      if (isCorrect) score++;

      return {
        questionId: question._id,
        question: question.question,
        selectedOption:
          Number.isInteger(selectedOption) ? selectedOption : null,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        totalQuestions,
        percentage,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
