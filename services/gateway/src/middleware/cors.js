import cors from "cors";

function allowedOrigins() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins().includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
