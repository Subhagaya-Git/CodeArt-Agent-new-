import rateLimit from "express-rate-limit";
import { getRedis } from "../config/redis.js";

const jsonMsg = (message) => ({ code: "RATE_LIMITED", message });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMsg("Too many authentication attempts. Please try again later."),
});

// Strict limiter for credential endpoints (login / register). Disabled in tests.
export function strictAuthLimiter(req, res, next) {
  if (process.env.NODE_ENV === "test") return next();
  return limiter(req, res, next);
}

// Brute-force lockout: N failed logins for an email -> temporary lock.
const MAX_FAILURES = 5;
const LOCK_SECONDS = 15 * 60;
const memory = new Map();

function key(email) {
  return `lockout:${String(email).toLowerCase()}`;
}

export const loginLockout = {
  async isLocked(email) {
    const redis = getRedis();
    if (redis) {
      const n = await redis.get(key(email));
      return n !== null && Number(n) >= MAX_FAILURES;
    }
    const rec = memory.get(key(email));
    if (!rec || rec.expiresAt < Date.now()) return false;
    return rec.count >= MAX_FAILURES;
  },

  async recordFailure(email) {
    const redis = getRedis();
    if (redis) {
      const n = await redis.incr(key(email));
      if (n === 1) await redis.expire(key(email), LOCK_SECONDS);
      return;
    }
    const rec = memory.get(key(email));
    if (!rec || rec.expiresAt < Date.now()) {
      memory.set(key(email), { count: 1, expiresAt: Date.now() + LOCK_SECONDS * 1000 });
    } else {
      rec.count += 1;
    }
  },

  async reset(email) {
    const redis = getRedis();
    if (redis) return redis.del(key(email));
    memory.delete(key(email));
  },

  // test helper
  _clear() {
    memory.clear();
  },
};
