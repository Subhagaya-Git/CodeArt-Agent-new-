import crypto from "node:crypto";
import { getRedis } from "../config/redis.js";

const PREFIX = "refresh:";

// In-memory fallback (tests / when Redis is unavailable). Keyed by jti.
const memory = new Map();

function key(jti) {
  return `${PREFIX}${jti}`;
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const refreshStore = {
  async save(jti, userId, ttlSeconds) {
    const redis = getRedis();
    if (redis) return redis.set(key(jti), userId, "EX", ttlSeconds);
    memory.set(key(jti), { userId, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async get(jti) {
    const redis = getRedis();
    if (redis) return redis.get(key(jti));
    const rec = memory.get(key(jti));
    if (!rec) return null;
    if (rec.expiresAt < Date.now()) {
      memory.delete(key(jti));
      return null;
    }
    return rec.userId;
  },

  async remove(jti) {
    const redis = getRedis();
    if (redis) return redis.del(key(jti));
    memory.delete(key(jti));
  },

  async removeAllForUser(userId) {
    const redis = getRedis();
    if (redis) {
      const keys = await redis.keys(`${PREFIX}*`);
      if (!keys.length) return 0;
      const pipe = redis.pipeline();
      keys.forEach((k) => pipe.get(k));
      const results = await pipe.exec();
      const del = redis.pipeline();
      let count = 0;
      results.forEach(([, val], i) => {
        if (val === userId) {
          del.del(keys[i]);
          count += 1;
        }
      });
      if (count) await del.exec();
      return count;
    }
    let count = 0;
    for (const [k, rec] of memory.entries()) {
      if (rec.userId === userId) {
        memory.delete(k);
        count += 1;
      }
    }
    return count;
  },

  // test helper
  _clear() {
    memory.clear();
  },
};
