const DailyGoal = require("../models/DailyGoal");

// Get daily goal
exports.getDailyGoal = async (req, res) => {
  try {
    let goal = await DailyGoal.findOne({
      user: req.user._id,
    });

    if (!goal) {
      goal = await DailyGoal.create({
        user: req.user._id,
        dailyTarget: 3,
      });
    }

    res.status(200).json({
      success: true,
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update daily goal
exports.updateDailyGoal = async (req, res) => {
  try {
    const { dailyTarget } = req.body;

    if (
      !Number.isInteger(dailyTarget) ||
      dailyTarget < 1 ||
      dailyTarget > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Daily target must be between 1 and 50.",
      });
    }

    const goal = await DailyGoal.findOneAndUpdate(
      { user: req.user._id },
      { dailyTarget },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Daily goal updated successfully.",
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};