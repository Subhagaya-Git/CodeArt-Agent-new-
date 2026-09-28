import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log(`[order-service] MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("[order-service] MongoDB connection error:", err.message);
    process.exit(1);
  }
}