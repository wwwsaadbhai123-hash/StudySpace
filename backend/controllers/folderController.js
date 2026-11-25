
const Folder = require("../models/Folder");

// Create Folder
exports.createFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    const folder = await Folder.create({
      name,
      description,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Folders
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Folder
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
