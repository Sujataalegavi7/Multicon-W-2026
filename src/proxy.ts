import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/jwt";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const WINDOW = 15 * 60 * 1000;

/**
 * Front gate for the app. Runs before every /api, /dashboard and /admin request:
 *  1. rate limiting (FR-AUTH-05 / NFR 5.1.5)
 *  2. CSRF-style same-origin check on mutating API calls
 *  3. cheap role gate for protected pages (signature only; route handlers re-check the DB)
 *
 * MongoDB and MinIO are never reachable from here or from the browser.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = clientIp(req.headers);

  if (pathname.startsWith("/api/")) {
    const isAuth = pathname === "/api/auth/login";
    const rl = isAuth ? rateLimit(`auth:${ip}`, 15, WINDOW) : rateLimit(`api:${ip}`, 300, WINDOW);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).host !== req.headers.get("host")) {
        return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // /dashboard and /admin
  const token = req.cookies.get(COOKIE)?.value;
  const claims = token ? await verifyToken(token) : null;
  const needsAdmin = pathname.startsWith("/admin");
  if (!claims || (needsAdmin && claims.role !== "admin")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"] };
