import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  REFRESH_TTL_SECONDS,
} from "../utils/jwt.js";
import { refreshStore } from "../services/refreshStore.js";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from "../utils/cookies.js";
import { loginLockout } from "../middleware/security.js";

/**
 * Issue a short-lived access token (returned to the client, kept in memory)
 * and a rotating refresh token stored in an httpOnly cookie + Redis.
 */
async function issueSession(res, user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user);
  await refreshStore.save(jti, String(user._id), REFRESH_TTL_SECONDS);
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ code: "EMAIL_TAKEN", message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const accessToken = await issueSession(res, user);
    return res.status(201).json({ message: "User registered", accessToken, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ code: "EMAIL_TAKEN", message: "Email already registered" });
    }
    return res.status(500).json({ code: "REGISTRATION_FAILED", message: "Registration failed" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    if (await loginLockout.isLocked(email)) {
      return res.status(429).json({
        code: "ACCOUNT_LOCKED",
        message: "Too many failed attempts. Try again later.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await loginLockout.recordFailure(email);
      return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await loginLockout.recordFailure(email);
      return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
    }

    await loginLockout.reset(email);
    const accessToken = await issueSession(res, user);
    return res.json({ message: "Login successful", accessToken, user });
  } catch {
    return res.status(500).json({ code: "LOGIN_FAILED", message: "Login failed" });
  }
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ code: "NO_REFRESH_TOKEN", message: "No refresh token" });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ code: "INVALID_REFRESH_TOKEN", message: "Invalid refresh token" });
  }

  const owner = await refreshStore.get(decoded.jti);
  if (!owner || owner !== decoded.sub) {
    // Unknown/revoked token (possible reuse) — reject and drop the cookie.
    clearRefreshCookie(res);
    return res.status(401).json({ code: "REFRESH_REVOKED", message: "Refresh token revoked" });
  }

  await refreshStore.remove(decoded.jti); // rotate
  const user = await User.findById(decoded.sub);
  if (!user) {
    clearRefreshCookie(res);
    return res.status(401).json({ code: "UNAUTHENTICATED", message: "User not found" });
  }

  const accessToken = await issueSession(res, user);
  return res.json({ accessToken, user });
}

export async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await refreshStore.remove(decoded.jti);
    } catch {
      // ignore invalid/expired refresh tokens on logout
    }
  }
  clearRefreshCookie(res);
  return res.json({ message: "Logged out" });
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch user" });
  }
}

export async function getProfile(req, res) {
  return me(req, res);
}

export async function verifyTokenEndpoint(req, res) {
  let token = req.cookies?.[REFRESH_COOKIE];
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) token = header.slice(7);
  if (!token) {
    return res.status(401).json({ valid: false, code: "NO_TOKEN", message: "No token provided" });
  }
  try {
    const decoded = verifyAccessToken(token);
    return res.json({ valid: true, user: { id: decoded.sub, role: decoded.role, name: decoded.name } });
  } catch {
    return res.status(401).json({ valid: false, code: "INVALID_TOKEN", message: "Invalid token" });
  }
}

export async function listUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch users" });
  }
}

export async function stats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    res.json({ totalUsers, totalAdmins });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch stats" });
  }
}
