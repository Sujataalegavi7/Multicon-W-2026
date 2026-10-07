import { cookies } from "next/headers";
import { connectDB } from "./db";
import { COOKIE, MAX_AGE, Role, verifyToken } from "./jwt";
import { HttpError } from "./http";
import { User } from "@/models/User";

export type SessionUser = { id: string; name: string; email: string; role: Role; department: string; loginId?: string };

export async function setAuthCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && (process.env.APP_URL ?? "").startsWith("https"),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(COOKIE);
}

/** Validates the JWT *and* re-checks the DB (isActive + tokenVersion) so revocation is immediate (FR-AUTH-04). */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const claims = await verifyToken(token);
  if (!claims) return null;
  await connectDB();
  const u = await User.findById(claims.sub).lean();
  if (!u || !u.isActive || u.tokenVersion !== claims.tv) return null;
  return { id: String(u._id), name: u.name, email: u.email, role: u.role as Role, department: u.department ?? "", loginId: u.loginId ?? undefined };
}

export async function requireUser(...roles: Role[]) {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Authentication required");
  if (roles.length && !roles.includes(s.role)) throw new HttpError(403, "Forbidden");
  return s;
}
