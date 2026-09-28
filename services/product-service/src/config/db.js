import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log(`[product-service] MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("[product-service] MongoDB connection error:", err.message);
    process.exit(1);
  }
}