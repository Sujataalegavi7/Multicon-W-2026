// jose-only module so proxy.ts can verify tokens without importing Mongoose.
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

export const COOKIE = "crr_token";
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 days (FR-AUTH-03)
export type Role = "contributor" | "admin";

const secret = () => {
  const s = env("JWT_SECRET");
  if (s.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
};

export async function signToken(userId: string, role: Role, tokenVersion: number) {
  return new SignJWT({ role, tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return { sub: String(payload.sub), role: payload.role as Role, tv: Number(payload.tv) };
  } catch {
    return null;
  }
}
