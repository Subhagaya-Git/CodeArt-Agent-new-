import "dotenv/config";
import { validateEnv, adminCredentials } from "./config/env.js";
validateEnv();
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { closeRedis } from "./config/redis.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const app = createApp();
const PORT = process.env.PORT || 4001;

async function seedAdmin() {
  const { email, password } = adminCredentials();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[auth-service] Admin user already exists: ${email}`);
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log(`[auth-service] Seeded admin user from environment: ${email}`);
}

connectDB().then(seedAdmin);

const server = app.listen(PORT, "0.0.0.0", () => console.log(`[auth-service] running on port ${PORT}`));
server.on("error", (err) => {
  console.error("[auth-service] Server error:", err.message);
  process.exit(1);
});

function gracefulShutdown(signal) {
  console.log(`[auth-service] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log("[auth-service] MongoDB connection closed");
    } catch (e) {
      console.error("[auth-service] Error closing MongoDB:", e.message);
    }
    try {
      await closeRedis();
    } catch (e) {
      console.error("[auth-service] Error closing Redis:", e.message);
    }
    console.log("[auth-service] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[auth-service] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
