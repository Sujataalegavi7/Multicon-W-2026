import { connectDB } from "@/lib/db";
import { ensureBucket } from "@/lib/minio";
import { handle, json } from "@/lib/http";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await connectDB();
  await mongoose.connection.db!.admin().ping();
  await ensureBucket();
  return json({ status: "ok", mongo: "up", storage: "up" });
});
