import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { Paper } from "@/models/Paper";
import { User } from "@/models/User";
import { audit } from "@/models/Log";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  department: z.string().trim().max(100).default(""),
});

export const GET = handle(async () => {
  await requireUser("admin");
  await connectDB();
  const [users, counts] = await Promise.all([
    User.find({ role: "contributor" }).sort({ createdAt: -1 }).lean(),
    Paper.aggregate([{ $group: { _id: "$uploadedBy", total: { $sum: 1 }, approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } } } }]),
  ]);
  const byUser = new Map(counts.map((c) => [String(c._id), c]));
  return json({
    contributors: users.map((u) => ({
      id: String(u._id), name: u.name, email: u.email, department: u.department ?? "", isActive: u.isActive,
      createdAt: new Date(u.createdAt as unknown as Date).toISOString(),
      papers: byUser.get(String(u._id))?.total ?? 0, approved: byUser.get(String(u._id))?.approved ?? 0,
    })),
  });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireUser("admin");
  const data = schema.parse(await req.json());
  await connectDB();
  if (await User.exists({ email: data.email })) throw new HttpError(409, "A user with this email already exists");
  const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 12), role: "contributor" });
  await audit(admin.id, `Created contributor account for ${user.email}`);
  return json({ contributor: { id: String(user._id), name: user.name, email: user.email } }, 201);
});
