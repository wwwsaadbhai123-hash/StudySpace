const mongoose = require("mongoose");

const Note = require("../models/Note");
const Folder = require("../models/Folder");
const StudyGroup = require("../models/StudyGroup");

const validateFolder = async (folderId, userId) => {
  if (!folderId) return true;

  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    return false;
  }

  const folder = await Folder.findOne({
    _id: folderId,
    user: userId,
  });

  return Boolean(folder);
};

// Create a note
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, folder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note title is required",
      });
    }

    if (folder && !(await validateFolder(folder, req.user._id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid folder",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      tags: Array.isArray(tags) ? tags : [],
      folder: folder || null,
      user: req.user._id,
      deletedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
};

// Get active notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      deletedAt: null,
    })
      .populate("folder", "name")
      .populate("sharedWith", "name description")
      .sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notes",
    });
  }
};

// Update an active note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, folder } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Note title is required",
        });
      }

      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;
    }

    if (tags !== undefined) {
      note.tags = Array.isArray(tags) ? tags : [];
    }

    if (folder !== undefined) {
      if (folder && !(await validateFolder(folder, req.user._id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid folder",
        });
      }

      note.folder = folder || null;
    }

    await note.save();

    await note.populate("folder", "name");
    await note.populate("sharedWith", "name description");

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
};

// Move an active note to Trash
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        deletedAt: null,
      },
      {
        $set: { deletedAt: new Date() },
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note moved to Trash",
      note,
    });
  } catch (error) {
    console.error("Move note to Trash error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to move note to Trash",
    });
  }
};

// Get notes in Trash
exports.getTrash = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      deletedAt: { $ne: null },
    })
      .populate("folder", "name")
      .populate("sharedWith", "name description")
      .sort({ deletedAt: -1 });

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Get Trash error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get Trash",
    });
  }
};

// Restore a note from Trash
exports.restoreNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        deletedAt: { $ne: null },
      },
      {
        $set: { deletedAt: null },
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found in Trash",
      });
    }

    await note.populate("folder", "name");
    await note.populate("sharedWith", "name description");

    return res.status(200).json({
      success: true,
      message: "Note restored successfully",
      note,
    });
  } catch (error) {
    console.error("Restore note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore note",
    });
  }
};

// Permanently delete a note from Trash
exports.permanentlyDeleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: { $ne: null },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found in Trash",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note permanently deleted",
    });
  } catch (error) {
    console.error("Permanent delete note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete note",
    });
  }
};

// Share an active note with a study group
exports.shareNote = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid study group",
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const group = await StudyGroup.findOne({
      _id: groupId,
      members: req.user._id,
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this study group",
      });
    }

    if (!note.sharedWith.some((id) => id.toString() === groupId)) {
      note.sharedWith.push(groupId);
      await note.save();
    }

    await note.populate("folder", "name");
    await note.populate("sharedWith", "name description");

    return res.status(200).json({
      success: true,
      message: "Note shared successfully",
      note,
    });
  } catch (error) {
    console.error("Share note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to share note",
    });
  }
};

// Stop sharing an active note with a study group
exports.unshareNote = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid study group",
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    note.sharedWith = note.sharedWith.filter(
      (id) => id.toString() !== groupId
    );

    await note.save();
    await note.populate("folder", "name");
    await note.populate("sharedWith", "name description");

    return res.status(200).json({
      success: true,
      message: "Note unshared successfully",
      note,
    });
  } catch (error) {
    console.error("Unshare note error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unshare note",
    });
  }
};

// Pin or unpin an active note
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      deletedAt: null,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    return res.status(200).json({
      success: true,
      message: note.isPinned
        ? "Note pinned successfully"
        : "Note unpinned successfully",
      note,
    });
  } catch (error) {
    console.error("Toggle note pin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to pin or unpin note",
    });
  }
};