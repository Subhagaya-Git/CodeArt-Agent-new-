import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "order-service" }));

app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 4004;

connectDB();

const server = app.listen(PORT, "0.0.0.0", () => console.log(`[order-service] running on port ${PORT}`));
server.on("error", (err) => {
  console.error("[order-service] Server error:", err.message);
  process.exit(1);
});

function gracefulShutdown(signal) {
  console.log(`[order-service] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log("[order-service] MongoDB connection closed");
    } catch (e) {
      console.error("[order-service] Error closing MongoDB:", e.message);
    }
    console.log("[order-service] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[order-service] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));