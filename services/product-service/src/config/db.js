import mongoose from "mongoose";

const SERVICE = "product-service";
const INITIAL_DELAY = 2000;
const MAX_DELAY = 30000;

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  mongoose.connection.on("connected", () =>
    console.log(`[${SERVICE}] MongoDB connected: ${mongoose.connection.name}`)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn(`[${SERVICE}] MongoDB disconnected — waiting for auto-reconnect`)
  );
  mongoose.connection.on("reconnected", () =>
    console.log(`[${SERVICE}] MongoDB reconnected`)
  );
  mongoose.connection.on("error", (err) =>
    console.error(`[${SERVICE}] MongoDB error: ${err.message}`)
  );

  let delay = INITIAL_DELAY;
  while (true) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
      });
      return;
    } catch (err) {
      console.error(`[${SERVICE}] MongoDB connection failed, retrying in ${delay / 1000}s... ${err.message}`);
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 1.5, MAX_DELAY);
    }
  }
}
