const required = ["PORT", "AUTH_SERVICE_URL", "PRODUCT_SERVICE_URL", "CART_SERVICE_URL", "ORDER_SERVICE_URL"];

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[gateway] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}