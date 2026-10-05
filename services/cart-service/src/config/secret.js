import fs from "node:fs";

export function readSecret(name) {
  const file = process.env[`${name}_FILE`];
  if (file) {
    try {
      return fs.readFileSync(file, "utf8").trim();
    } catch (err) {
      console.error(`[cart-service] Failed to read secret file for ${name}: ${err.message}`);
      process.exit(1);
    }
  }
  const value = process.env[name];
  return value === undefined ? undefined : value;
}