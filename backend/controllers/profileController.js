
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const streamifier = require("streamifier");

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "studyspace/profile-pictures",
        transformation: [
          { width: 500, height: 500, crop: "fill" },
        ],
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({
            message: "Image upload failed.",
          });
        }

        user.profilePicture = result.secure_url;
        await user.save();

        return res.status(200).json({
          message: "Profile picture uploaded successfully.",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          },
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Profile picture error:", error);

    res.status(500).json({
      message: "Server error while uploading profile picture.",
    });
  }
};

module.exports = { uploadProfilePicture };
