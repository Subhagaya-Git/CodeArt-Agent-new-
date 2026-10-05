process.env.INTERNAL_API_KEY = "check_internal_key_0123456789";
const { createApp } = await import("./src/app.js");
const app = createApp();
console.log("product createApp OK:", typeof app === "function");