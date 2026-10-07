import { NextRequest } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { User } from "@/models/User";
import { audit } from "@/models/Log";

const schema = z.object({
  isActive: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200).optional(),
});

export const PATCH = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("admin");
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "User not found");
  const { isActive, password } = schema.parse(await req.json());
  if (isActive === undefined && !password) throw new HttpError(400, "Nothing to update");

  await connectDB();
  const user = await User.findOne({ _id: id, role: "contributor" });
  if (!user) throw new HttpError(404, "Contributor not found");

  // FR-ADMIN-07: any deactivation or password reset bumps tokenVersion, killing live sessions.
  if (isActive !== undefined && isActive !== user.isActive) {
    user.isActive = isActive;
    if (!isActive) user.tokenVersion += 1;
    await audit(admin.id, `${isActive ? "Reactivated" : "Deactivated"} account ${user.email}`);
  }
  if (password) {
    user.password = await bcrypt.hash(password, 12);
    user.tokenVersion += 1;
    await audit(admin.id, `Reset password for ${user.email}`);
  }
  await user.save();
  return json({ ok: true, isActive: user.isActive });
});
