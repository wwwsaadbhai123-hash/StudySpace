
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const checkTaskReminders = require("./services/reminderService");

const dailyGoalRoutes = require("./routes/dailyGoalRoutes");
const streakRoutes = require("./routes/streakRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const studyChallengeRoutes = require("./routes/studyChallengeRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

const protect = require("./middleware/authMiddleware");
const maintenanceMiddleware = require("./middleware/maintenanceMiddleware");

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

// HOME ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to StudySpace API!",
  });
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudySpace backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// AUTHENTICATION ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// APPLICATION ROUTES
const appRoutes = [
  ["/api/notes", require("./routes/noteRoutes")],
  ["/api/folders", require("./routes/folderRoutes")],
  ["/api/groups", require("./routes/studyGroupRoutes")],
  ["/api/messages", require("./routes/messageRoutes")],
  ["/api/notifications", require("./routes/notificationRoutes")],
  ["/api/profile", require("./routes/profileRoutes")],
  ["/api/tasks", require("./routes/taskRoutes")],
  ["/api/daily-goal", dailyGoalRoutes],
  ["/api/streak", streakRoutes],
  ["/api/study-sessions", studySessionRoutes],
  ["/api/achievements", achievementRoutes],
  ["/api/flashcards", flashcardRoutes],
  ["/api/quizzes", quizRoutes],
  ["/api/leaderboard", leaderboardRoutes],
  ["/api/study-challenges", studyChallengeRoutes],
  ["/api/resources", resourceRoutes],
  ["/api/feedback", feedbackRoutes],
];

appRoutes.forEach(([path, router]) => {
  app.use(path, protect, maintenanceMiddleware, router);
});

// ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// SOCKET.IO GROUP CHAT
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    if (!groupId) return;
    socket.join(`group_${groupId}`);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    if (!groupId) return;
    socket.leave(`group_${groupId}`);
    console.log(`Socket ${socket.id} left group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// SERVER START
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must contain at least 32 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");

    checkTaskReminders();

    setInterval(() => {
      checkTaskReminders();
    }, 60 * 1000);

    server.listen(PORT, () => {
      console.log(`StudySpace server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();
