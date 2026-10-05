import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { readSecret } from "../config/secret.js";

export const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function secret() {
  return readSecret("JWT_SECRET");
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id || user.id),
      role: user.role,
      name: user.name,
      typ: "access",
    },
    secret(),
    { expiresIn: ACCESS_TTL_SECONDS }
  );
}

export function signRefreshToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: String(user._id || user.id), typ: "refresh", jti },
    secret(),
    { expiresIn: REFRESH_TTL_SECONDS }
  );
  return { token, jti };
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, secret());
  if (decoded.typ !== "access") throw new Error("Not an access token");
  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, secret());
  if (decoded.typ !== "refresh") throw new Error("Not a refresh token");
  return decoded;
}
