
const Message = require("../models/Message");
const StudyGroup = require("../models/StudyGroup");
const Notification = require("../models/Notification");

// Check whether user belongs to the group
const checkGroupMembership = (group, userId) => {
  return group.members.some((member) => {
    const memberId = member._id
      ? member._id.toString()
      : member.toString();

    return memberId === userId.toString();
  });
};

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { groupId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found",
      });
    }

    const isMember = checkGroupMembership(
      group,
      req.user._id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must be a group member to send messages",
      });
    }

    // Save message
    const newMessage = await Message.create({
      group: groupId,
      sender: req.user._id,
      message: message.trim(),
    });

    await newMessage.populate("sender", "name");

    // Create notifications for other group members
    try {
      const recipients = group.members
        .map((member) =>
          member._id ? member._id : member
        )
        .filter(
          (memberId) =>
            memberId.toString() !== req.user._id.toString()
        );

      if (recipients.length > 0) {
        const notifications = recipients.map(
          (recipientId) => ({
            recipient: recipientId,
            sender: req.user._id,
            type: "new_message",
            message: `${newMessage.sender.name} sent a message in ${group.name}`,
            group: groupId,
          })
        );

        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      console.error(
        "Notification Creation Error:",
        notificationError
      );
    }

    // Broadcast message through Socket.IO
    const io = req.app.get("io");

    if (io) {
      io.to(`group_${groupId}`).emit(
        "newMessage",
        newMessage
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Group Messages
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Study group not found",
      });
    }

    const isMember = checkGroupMembership(
      group,
      req.user._id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must be a group member to view messages",
      });
    }

    const messages = await Message.find({
      group: groupId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
