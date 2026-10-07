import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HttpError, handle, json, escapeRegex } from "@/lib/http";
import { setAuthCookie } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { User } from "@/models/User";

const schema = z.object({ identifier: z.string().trim().min(1).max(200), password: z.string().min(1).max(200) });
// Compared against when the user doesn't exist so response time doesn't reveal valid accounts.
const DUMMY = bcrypt.hashSync("timing-safe-dummy", 12);

export const POST = handle(async (req: NextRequest) => {
  const { identifier, password } = schema.parse(await req.json());
  await connectDB();
  const exact = new RegExp(`^${escapeRegex(identifier)}$`, "i");
  const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { loginId: exact }] }).select("+password");

  const ok = await bcrypt.compare(password, user?.password ?? DUMMY);
  if (!user || !ok) throw new HttpError(401, "Invalid credentials");
  if (!user.isActive) throw new HttpError(403, "This account has been deactivated");

  await setAuthCookie(await signToken(String(user._id), user.role as "admin" | "contributor", user.tokenVersion));
  return json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role, department: user.department } });
});
