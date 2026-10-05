import Redis from "ioredis";

let client = null;

/**
 * Shared Redis client (lazy). Returns null in the test environment so unit
 * tests use the in-memory fallback in the refresh/lockout stores instead of
 * requiring a live Redis server.
 */
export function getRedis() {
  if (process.env.NODE_ENV === "test") return null;
  if (client) return client;

  const url = process.env.REDIS_URL || "redis://localhost:6379";
  let loggedError = false;
  client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
  });
  client.on("error", (err) => {
    if (!loggedError) {
      console.error(`[auth-service] Redis error: ${err.message}`);
      loggedError = true;
    }
  });
  client.on("connect", () => {
    loggedError = false;
    console.log("[auth-service] Redis connected");
  });
  return client;
}

export async function closeRedis() {
  if (client) {
    await client.quit().catch(() => {});
    client = null;
  }
}
