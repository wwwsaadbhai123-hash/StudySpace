
const Resource = require("../models/Resource");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const publicId = `studyspace/resources/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        folder: undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier
      .createReadStream(file.buffer)
      .pipe(uploadStream);
  });
};

// Upload Resource
exports.uploadResource = async (req, res) => {
  let uploadedFile = null;

  try {
    const { title, description, subject } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resource title is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload.",
      });
    }

    uploadedFile = await uploadToCloudinary(req.file);

    const resource = await Resource.create({
      title: title.trim(),
      description: description || "",
      subject: subject?.trim() || "General",
      originalName: req.file.originalname,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Resource uploaded successfully.",
      resource,
    });
  } catch (error) {
    if (uploadedFile?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedFile.public_id,
          { resource_type: "raw" }
        );
      } catch (cleanupError) {
        console.error("Cloudinary Cleanup Error:", cleanupError.message);
      }
    }

    console.error("Upload Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload resource.",
    });
  }
};

// Get My Resources
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Get Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load resources.",
    });
  }
};

// Delete Resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    await cloudinary.uploader.destroy(
      resource.publicId,
      { resource_type: "raw" }
    );

    await resource.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete resource.",
    });
  }
};
