import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const app = createApp();
const PORT = process.env.PORT || 4001;

async function seedAdmin() {
  const email = "admin@shophub.com";
  const existing = await User.findOne({ email });
  if (existing) return;
  const hashed = await bcrypt.hash("admin12345", 10);
  await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log("[auth-service] Seeded admin user: admin@shophub.com / admin12345");
}

connectDB().then(seedAdmin);

app.listen(PORT, () => console.log(`[auth-service] running on port ${PORT}`));
