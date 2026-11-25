
const Flashcard = require("../models/Flashcard");

// CREATE FLASHCARD
exports.createFlashcard = async (req, res) => {
  try {
    const { question, answer, subject, difficulty } = req.body;

    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const flashcard = await Flashcard.create({
      question,
      answer,
      subject,
      difficulty,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Flashcard created successfully",
      flashcard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL FLASHCARDS
exports.getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE FLASHCARD
exports.updateFlashcard = async (req, res) => {
  try {
    const { question, answer, subject, difficulty } = req.body;

    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
      });
    }

    if (question !== undefined) flashcard.question = question;
    if (answer !== undefined) flashcard.answer = answer;
    if (subject !== undefined) flashcard.subject = subject;
    if (difficulty !== undefined) flashcard.difficulty = difficulty;

    await flashcard.save();

    res.status(200).json({
      success: true,
      message: "Flashcard updated successfully",
      flashcard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE FLASHCARD
exports.deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
