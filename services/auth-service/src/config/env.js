const required = ["JWT_SECRET", "MONGO_URI", "PORT"];

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[auth-service] Missing required environment variables: ${missing.join(", ")}`);
    console.error("Set them in .env or as environment variables. JWT_SECRET must be defined.");
    process.exit(1);
  }
}