import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(corsMiddleware);

app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok", service: "gateway" }));

app.use("/api", apiRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, "0.0.0.0", () => console.log(`[gateway] running on port ${PORT}`));
server.on("error", (err) => {
  console.error("[gateway] Server error:", err.message);
  process.exit(1);
});

function gracefulShutdown(signal) {
  console.log(`[gateway] ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("[gateway] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[gateway] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));