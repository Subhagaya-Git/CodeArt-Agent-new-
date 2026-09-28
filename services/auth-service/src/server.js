import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "auth-service" }));

app.use("/api/auth", authRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

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