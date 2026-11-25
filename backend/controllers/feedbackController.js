
const Feedback = require("../models/Feedback");

// Submit Feedback
exports.createFeedback = async (req, res) => {
  try {
    const { subject, message, type } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required.",
      });
    }

    const feedback = await Feedback.create({
      subject: subject.trim(),
      message: message.trim(),
      type: type || "Feedback",
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Create Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit feedback.",
    });
  }
};

// Get My Feedback
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Get Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load feedback.",
    });
  }
};

// Delete My Pending Feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "Pending",
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Pending feedback not found.",
      });
    }

    await feedback.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete feedback.",
    });
  }
};
