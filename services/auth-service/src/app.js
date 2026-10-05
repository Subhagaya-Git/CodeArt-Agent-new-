import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/authRoutes.js";
import { requireInternalKey } from "./middleware/internal.js";

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

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors({ origin: corsOrigin(), credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ status: "ok", service: "auth-service" }));

  // Internal service routes require the gateway's shared key.
  app.use("/api", requireInternalKey);
  app.use("/api/auth", authRoutes);

  app.use((req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Route not found" }));

  return app;
}
