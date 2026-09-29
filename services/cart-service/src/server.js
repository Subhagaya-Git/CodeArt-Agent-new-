import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "cart-service" }));

app.use("/api/cart", cartRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 4003;

connectDB();

const server = app.listen(PORT, "0.0.0.0", () => console.log(`[cart-service] running on port ${PORT}`));
server.on("error", (err) => {
  console.error("[cart-service] Server error:", err.message);
  process.exit(1);
});

function gracefulShutdown(signal) {
  console.log(`[cart-service] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log("[cart-service] MongoDB connection closed");
    } catch (e) {
      console.error("[cart-service] Error closing MongoDB:", e.message);
    }
    console.log("[cart-service] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[cart-service] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));