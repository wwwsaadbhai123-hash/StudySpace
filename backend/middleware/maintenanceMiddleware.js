
const Setting = require("../models/Setting");

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const settings = await Setting.findOne();

    if (
      settings &&
      settings.maintenanceMode === true &&
      req.user?.role !== "admin"
    ) {
      return res.status(503).json({
        success: false,
        maintenanceMode: true,
        message:
          "StudySpace is currently under maintenance. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Maintenance Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify platform status.",
    });
  }
};

module.exports = maintenanceMiddleware;
