import mongoose from "mongoose";
import { env } from "./env";

const g = globalThis as unknown as { _mongo?: Promise<typeof mongoose> };

export function connectDB() {
  if (!g._mongo) {
    g._mongo = mongoose.connect(env("MONGODB_URI"), { serverSelectionTimeoutMS: 8000 });
    g._mongo.catch(() => { g._mongo = undefined; });
  }
  return g._mongo;
}
