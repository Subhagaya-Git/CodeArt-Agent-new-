import { readSecret } from "./secret.js";

const required = ["PORT", "AUTH_SERVICE_URL", "PRODUCT_SERVICE_URL", "CART_SERVICE_URL", "ORDER_SERVICE_URL"];

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[gateway] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const internalKey = readSecret("INTERNAL_API_KEY");
  if (!internalKey || internalKey.length < 16) {
    console.error("[gateway] FATAL: INTERNAL_API_KEY must be set (>= 16 chars) for service-to-service auth.");
    process.exit(1);
  }
}
