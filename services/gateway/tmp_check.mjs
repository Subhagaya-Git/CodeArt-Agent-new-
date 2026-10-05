process.env.INTERNAL_API_KEY = "check_internal_key_0123456789";
process.env.AUTH_SERVICE_URL = "http://localhost:4001";
process.env.PRODUCT_SERVICE_URL = "http://localhost:4002";
process.env.CART_SERVICE_URL = "http://localhost:4003";
process.env.ORDER_SERVICE_URL = "http://localhost:4004";
await import("./src/routes/index.js");
console.log("gateway routes import OK");
