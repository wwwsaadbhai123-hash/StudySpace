
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check whether this session exists and is still active.
    if (!decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again.",
      });
    }

    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      user: decoded.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired or been terminated. Please login again.",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Update session activity time.
    session.lastActiveAt = new Date();
    await session.save();

    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;
