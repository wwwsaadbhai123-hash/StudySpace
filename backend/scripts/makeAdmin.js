
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function makeAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing.");
    }

    if (!process.env.ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL.toLowerCase().trim() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.log("User not found. Register this email first.");
      return;
    }

    console.log(`${user.email} is now an admin.`);
  } catch (error) {
    console.error("Admin setup error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
