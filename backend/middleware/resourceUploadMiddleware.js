
const multer = require("multer");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error("Only PDF, Word, PowerPoint, Excel, and TXT files are allowed.")
    );
  }
};

const uploadResource = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = uploadResource;
