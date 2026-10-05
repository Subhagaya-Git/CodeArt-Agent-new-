import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Accept the access token from the httpOnly cookie if present, otherwise
 * from an `Authorization: Bearer <token>` header (API clients / tests).
 */
function extractToken(req) {
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res
      .status(401)
      .json({ code: "UNAUTHENTICATED", message: "Authentication required" });
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, name: decoded.name };
    next();
  } catch {
    return res
      .status(401)
      .json({ code: "INVALID_TOKEN", message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Admin access required" });
  }
  next();
}
