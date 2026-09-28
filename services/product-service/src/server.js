import "dotenv/config";
import { validateEnv } from "./config/env.js";
validateEnv();
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import Product from "./models/Product.js";

const app = createApp();
const PORT = process.env.PORT || 4002;

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;
  const samples = [
    { name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones with 30h battery.", price: 129.99, stock: 25, category: "Electronics", image_url: "https://picsum.photos/seed/headphones/600/400" },
    { name: "Bluetooth Speaker", description: "Portable waterproof speaker with deep bass.", price: 59.99, stock: 40, category: "Electronics", image_url: "https://picsum.photos/seed/speaker/600/400" },
    { name: "Cotton T-Shirt", description: "Soft breathable cotton crew-neck t-shirt.", price: 19.99, stock: 100, category: "Clothing", image_url: "https://picsum.photos/seed/tshirt/600/400" },
    { name: "Denim Jeans", description: "Slim-fit stretch denim jeans.", price: 49.99, stock: 60, category: "Clothing", image_url: "https://picsum.photos/seed/jeans/600/400" },
    { name: "Coffee Mug", description: "Ceramic 12oz mug, dishwasher safe.", price: 9.99, stock: 200, category: "Home", image_url: "https://picsum.photos/seed/mug/600/400" },
    { name: "Desk Lamp", description: "LED adjustable desk lamp with USB port.", price: 34.99, stock: 35, category: "Home", image_url: "https://picsum.photos/seed/lamp/600/400" },
    { name: "Running Shoes", description: "Lightweight cushioned running shoes.", price: 89.99, stock: 50, category: "Sports", image_url: "https://picsum.photos/seed/shoes/600/400" },
    { name: "Yoga Mat", description: "Non-slip eco-friendly yoga mat.", price: 29.99, stock: 70, category: "Sports", image_url: "https://picsum.photos/seed/yogamat/600/400" },
    { name: "Smart Watch", description: "Fitness tracking smart watch with heart-rate monitor.", price: 199.99, stock: 15, category: "Electronics", image_url: "https://picsum.photos/seed/watch/600/400" },
    { name: "Backpack", description: "Water-resistant 30L travel backpack.", price: 79.99, stock: 45, category: "Accessories", image_url: "https://picsum.photos/seed/backpack/600/400" },
    { name: "Sunglasses", description: "UV400 polarized sunglasses.", price: 24.99, stock: 80, category: "Accessories", image_url: "https://picsum.photos/seed/sunglasses/600/400" },
    { name: "Water Bottle", description: "Insulated stainless steel 1L bottle.", price: 22.99, stock: 120, category: "Home", image_url: "https://picsum.photos/seed/bottle/600/400" },
  ];
  await Product.insertMany(samples);
  console.log("[product-service] Seeded 12 sample products");
}

connectDB().then(seedProducts);

app.listen(PORT, () => console.log(`[product-service] running on port ${PORT}`));
