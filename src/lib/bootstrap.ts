import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { ensureBucket } from "./minio";
import { User } from "@/models/User";
import { Paper } from "@/models/Paper";
import { Log } from "@/models/Log";

/** Runs once at server start: indexes, MinIO bucket, and first-admin seeding (FR-AUTH-06). */
export async function bootstrap() {
  await connectDB();
  await Promise.all([User.init(), Paper.init(), Log.init()]);

  // MinIO is optional in local dev — warn but don't abort so admin seeding still runs.
  try {
    await ensureBucket();
  } catch (err) {
    console.warn("MinIO unavailable — file uploads will not work until MinIO is running.", err);
  }

  if (await User.exists({ role: "admin" })) return;
  const { ADMIN_LOGIN_ID, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_LOGIN_ID || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("No admin exists and ADMIN_* env vars are not set; skipping admin seed.");
    return;
  }
  await User.create({
    name: "Administrator",
    email: ADMIN_EMAIL,
    loginId: ADMIN_LOGIN_ID,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "admin",
  });
  console.log(`Seeded admin account (${ADMIN_LOGIN_ID}).`);
}
