
const User = require("../models/User");
const Setting = require("../models/Setting");
const LoginActivity = require("../models/LoginActivity");
const Session = require("../models/Session");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const createToken = (userId, sessionId) => {
  return jwt.sign(
    { userId, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// CREATE USER SESSION
const createUserSession = async (req, user) => {
  const sessionId = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await Session.create({
    user: user._id,
    sessionId,
    ipAddress: req.ip || "Unknown",
    userAgent: req.headers["user-agent"] || "Unknown",
    lastActiveAt: new Date(),
    expiresAt,
  });

  return createToken(user._id, sessionId);
};

// LOGIN ACTIVITY LOGGER
const logLoginActivity = async (
  req,
  { user = null, email, status, failureReason = "" }
) => {
  try {
    await LoginActivity.create({
      user: user?._id || null,
      email: email || "unknown",
      status,
      ipAddress: req.ip || "Unknown",
      userAgent: req.headers["user-agent"] || "Unknown",
      failureReason,
    });
  } catch (error) {
    console.error("Login Activity Logging Error:", error);
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const settings = await Setting.findOne();

    if (settings && settings.allowRegistration === false) {
      return res.status(403).json({
        success: false,
        message:
          "New registrations are currently disabled by the administrator.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
      });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = await createUserSession(req, user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      await logLoginActivity(req, {
        email: normalizedEmail,
        status: "failed",
        failureReason: "Invalid email or password",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await logLoginActivity(req, {
        user,
        email: normalizedEmail,
        status: "failed",
        failureReason: "Invalid email or password",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    await logLoginActivity(req, {
      user,
      email: normalizedEmail,
      status: "success",
    });

    const token = await createUserSession(req, user);

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};

// GET PROFILE
exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture || "",
      role: req.user.role,
    },
  });
};

// GET MY ACTIVE SESSIONS
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActiveAt: -1 });

    const currentSessionId = req.session?.sessionId;

    return res.json({
      success: true,
      sessions: sessions.map((session) => ({
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: session.sessionId === currentSessionId,
      })),
    });
  } catch (error) {
    console.error("Get My Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your active sessions.",
    });
  }
};

// REVOKE MY SESSION
exports.revokeMySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid session ID is required.",
      });
    }

    const session = await Session.findOne({
      user: req.user._id,
      sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Active session not found.",
      });
    }

    session.revokedAt = new Date();
    await session.save();

    const isCurrent = req.session?.sessionId === sessionId;

    return res.json({
      success: true,
      message: isCurrent
        ? "Current session logged out successfully."
        : "Device logged out successfully.",
      isCurrent,
    });
  } catch (error) {
    console.error("Revoke My Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to terminate this session.",
    });
  }
};

// GET MY LOGIN HISTORY
exports.getMyLoginHistory = async (req, res) => {
  try {
    const activities = await LoginActivity.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select(
        "status ipAddress userAgent failureReason createdAt"
      )
      .lean();

    return res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Get My Login History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your login history.",
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    if (typeof name !== "string" || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use.",
      });
    }

    const user = await User.findById(req.user._id);

    user.name = trimmedName;
    user.email = normalizedEmail;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};
// REVOKE ALL OTHER ACTIVE SESSIONS
exports.revokeOtherSessions = async (req, res) => {
  try {
    const currentSessionId = req.session?.sessionId;

    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        message: "Current session could not be identified.",
      });
    }

    const result = await Session.updateMany(
      {
        user: req.user._id,
        sessionId: { $ne: currentSessionId },
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { revokedAt: new Date() },
      }
    );

    return res.json({
      success: true,
      message: "All other devices have been logged out.",
      terminatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Revoke Other Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log out other devices.",
    });
  }
};
