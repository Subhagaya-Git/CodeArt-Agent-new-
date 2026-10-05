import jwt from "jsonwebtoken";
import { readSecret } from "../config/secret.js";

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, readSecret("JWT_SECRET"));
  if (decoded.typ !== "access") throw new Error("Not an access token");
  return decoded;
}

// Backwards-compatible alias.
export const verifyToken = verifyAccessToken;
