import { readSecret } from "./secret.js";

const PROD = () => process.env.NODE_ENV === "production";

// Known weak / placeholder / previously-committed secrets that must never be used.
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

const DEFAULT_ADMIN_EMAIL = "admin@shophub.com";
const DEFAULT_ADMIN_PASSWORD = "admin12345";

function fail(message) {
  console.error(`[auth-service] FATAL: ${message}`);
  process.exit(1);
}

export function validateEnv() {
  const missing = ["MONGO_URI", "PORT"].filter((k) => !process.env[k]);
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

  if (PROD()) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = readSecret("ADMIN_PASSWORD");
    if (!adminEmail || !adminPassword) {
      fail("ADMIN_EMAIL and ADMIN_PASSWORD are required in production.");
    }
    if (
      adminEmail.toLowerCase() === DEFAULT_ADMIN_EMAIL ||
      adminPassword === DEFAULT_ADMIN_PASSWORD
    ) {
      fail("Refusing to start in production with default admin credentials.");
    }
    if (adminPassword.length < 12) {
      fail("ADMIN_PASSWORD must be at least 12 characters in production.");
    }
  }
}

// Dev-only fallbacks so local flows keep working; production is guarded above.
export function adminCredentials() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = readSecret("ADMIN_PASSWORD") || DEFAULT_ADMIN_PASSWORD;
  if (PROD() && (email === DEFAULT_ADMIN_EMAIL || password === DEFAULT_ADMIN_PASSWORD)) {
    fail("Refusing to seed default admin credentials in production.");
  }
  return { email, password };
}
