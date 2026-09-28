import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok", service: "gateway" }));

app.use("/api", apiRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[gateway] running on port ${PORT}`));