import crypto from "node:crypto";
import { readSecret } from "../config/secret.js";

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function requireInternalKey(req, res, next) {
  if (process.env.NODE_ENV === "test") return next();

  const expected = readSecret("INTERNAL_API_KEY");
  const provided = req.headers["x-internal-key"];
  if (!expected || !provided || !safeEqual(expected, provided)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Internal service access only" });
  }
  next();
}