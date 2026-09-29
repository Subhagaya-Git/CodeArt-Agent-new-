import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import Product from "./models/Product.js";

const app = createApp();
const PORT = process.env.PORT || 4002;

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;
  const svgSlugs = new Set(["cotton-tshirt", "wireless-headphones"]);
  const img = (slug) => `/images/products/${slug}.${svgSlugs.has(slug) ? "svg" : "jpg"}`;
  const samples = [
    { name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones with 30h battery.", price: 129.99, stock: 25, category: "Electronics", image_url: img("wireless-headphones") },
    { name: "Bluetooth Speaker", description: "Portable waterproof speaker with deep bass.", price: 59.99, stock: 40, category: "Electronics", image_url: img("bluetooth-speaker") },
    { name: "Cotton T-Shirt", description: "Soft breathable cotton crew-neck t-shirt.", price: 19.99, stock: 100, category: "Clothing", image_url: img("cotton-tshirt") },
    { name: "Denim Jeans", description: "Slim-fit stretch denim jeans.", price: 49.99, stock: 60, category: "Clothing", image_url: img("denim-jeans") },
    { name: "Coffee Mug", description: "Ceramic 12oz mug, dishwasher safe.", price: 9.99, stock: 200, category: "Home", image_url: img("coffee-mug") },
    { name: "Desk Lamp", description: "LED adjustable desk lamp with USB port.", price: 34.99, stock: 35, category: "Home", image_url: img("desk-lamp") },
    { name: "Running Shoes", description: "Lightweight cushioned running shoes.", price: 89.99, stock: 50, category: "Sports", image_url: img("running-shoes") },
    { name: "Yoga Mat", description: "Non-slip eco-friendly yoga mat.", price: 29.99, stock: 70, category: "Sports", image_url: img("yoga-mat") },
    { name: "Smart Watch", description: "Fitness tracking smart watch with heart-rate monitor.", price: 199.99, stock: 15, category: "Electronics", image_url: img("smart-watch") },
    { name: "Backpack", description: "Water-resistant 30L travel backpack.", price: 79.99, stock: 45, category: "Accessories", image_url: img("backpack") },
    { name: "Sunglasses", description: "UV400 polarized sunglasses.", price: 24.99, stock: 80, category: "Accessories", image_url: img("sunglasses") },
    { name: "Water Bottle", description: "Insulated stainless steel 1L bottle.", price: 22.99, stock: 120, category: "Home", image_url: img("water-bottle") },
  ];
  await Product.insertMany(samples);
  console.log("[product-service] Seeded 12 sample products");
}

connectDB().then(seedProducts);

const server = app.listen(PORT, "0.0.0.0", () => console.log(`[product-service] running on port ${PORT}`));
server.on("error", (err) => {
  console.error("[product-service] Server error:", err.message);
  process.exit(1);
});

function gracefulShutdown(signal) {
  console.log(`[product-service] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log("[product-service] MongoDB connection closed");
    } catch (e) {
      console.error("[product-service] Error closing MongoDB:", e.message);
    }
    console.log("[product-service] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[product-service] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
