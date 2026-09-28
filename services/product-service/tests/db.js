import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

const SYSTEM_MONGOD =
  process.env.MONGOD_PATH || "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";

export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create({
    binary: { systemBinary: SYSTEM_MONGOD },
    instance: { storageEngine: "wiredTiger" },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return uri;
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
