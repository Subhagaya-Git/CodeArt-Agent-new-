import { readSecret } from "./secret.js";

const WEAK_SECRETS = new Set(
  [
    "secret",
    "jwt_secret",
    "changeme",
    "change_me",
    "change-me",
    "password",
    "shophub_dev_secret_change_me_9f3a7c1e4b2d8a6f5e1c3b9d7a2f4e8c",
    "test_jwt_secret_for_phase0",
  ].map((s) => s.toLowerCase())
);

function fail(message) {
  console.error(`[cart-service] FATAL: ${message}`);
  process.exit(1);
}

export function validateEnv() {
  const missing = ["MONGO_URI", "PORT", "PRODUCT_SERVICE_URL"].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    fail(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const jwtSecret = readSecret("JWT_SECRET");
  if (!jwtSecret) fail("JWT_SECRET is required (env var or JWT_SECRET_FILE).");
  if (jwtSecret.length < 32) fail("JWT_SECRET must be at least 32 characters long.");
  if (WEAK_SECRETS.has(jwtSecret.toLowerCase())) {
    fail("JWT_SECRET is a known weak/default value. Generate a strong random secret.");
  }

  const internalKey = readSecret("INTERNAL_API_KEY");
  if (!internalKey || internalKey.length < 16) {
    fail("INTERNAL_API_KEY must be set (>= 16 chars) for service-to-service auth.");
  }
}
