
const StudyGroup = require("../models/StudyGroup");
const Note = require("../models/Note");

// Create Study Group
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const group = await StudyGroup.create({
      name: name.trim(),
      description: description || "",
      createdBy: req.user._id,
      members: [req.user._id],
    });

    return res.status(201).json({
      success: true,
      message: "Study group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create study group",
    });
  }
};

// Get All Study Groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch study groups",
    });
  }
};

// Get Single Group Details
exports.getGroupDetails = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found",
      });
    }

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Get group details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch group details",
    });
  }
};

// Join Study Group
exports.joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found",
      });
    }

    const alreadyMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member",
      });
    }

    group.members.push(req.user._id);
    await group.save();

    return res.status(200).json({
      success: true,
      message: "Joined study group successfully",
      group,
    });
  } catch (error) {
    console.error("Join group error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join study group",
    });
  }
};

// Leave Study Group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found",
      });
    }

    if (
      group.createdBy.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Group creator cannot leave their own group",
      });
    }

    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );

    await group.save();

    return res.status(200).json({
      success: true,
      message: "Left study group successfully",
    });
  } catch (error) {
    console.error("Leave group error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to leave study group",
    });
  }
};

// GET SHARED NOTES OF A STUDY GROUP
exports.getSharedNotes = async (req, res) => {
  try {
    const group = await StudyGroup.findOne({
      _id: req.params.id,
      members: req.user._id,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member",
      });
    }

    const notes = await Note.find({
      sharedWith: group._id,
    })
      .populate("user", "name")
      .populate("folder", "name")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get shared notes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch shared notes",
    });
  }
};
