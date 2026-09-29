import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import productRoutes from "./routes/productRoutes.js";

export function createApp() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ status: "ok", service: "product-service" }));

  app.use("/api/products", productRoutes);

  app.use((req, res) => res.status(404).json({ message: "Route not found" }));

  return app;
}