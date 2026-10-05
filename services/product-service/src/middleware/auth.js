import { verifyAccessToken } from "../utils/jwt.js";

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
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
    return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Admin access required" });
  }
  next();
}
