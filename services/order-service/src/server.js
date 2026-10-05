import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import orderRoutes from "./routes/orderRoutes.js";
import { requireInternalKey } from "./middleware/internal.js";

const app = express();
app.disable("x-powered-by");

function corsOrigin() {
  const list = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (origin, cb) => {
    if (!origin || list.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  };
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: corsOrigin(), credentials: true }));
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "order-service" }));

app.use("/api", requireInternalKey);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Route not found" }));

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
