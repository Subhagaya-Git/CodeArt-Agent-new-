import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";

export function createApp() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ status: "ok", service: "auth-service" }));

  app.use("/api/auth", authRoutes);

  app.use((req, res) => res.status(404).json({ message: "Route not found" }));

  return app;
}