const { validateEnv } = await import("./src/config/env.js");
validateEnv();
console.log("validateEnv passed");