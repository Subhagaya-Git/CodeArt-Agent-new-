import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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

app.listen(PORT, () => console.log(`[order-service] running on port ${PORT}`));