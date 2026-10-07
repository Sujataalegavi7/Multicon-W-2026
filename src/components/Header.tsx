import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "@/lib/jwt";
import LogoutButton from "./LogoutButton";
import NavLinks from "./NavLinks";

export default async function Header() {
  const token = (await cookies()).get(COOKIE)?.value;
  const claims = token ? await verifyToken(token) : null;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Brand */}
        <Link href="/" className="navbar__brand">
          <Image src="/tcet-logo.png" alt="TCET Logo" width={44} height={44} className="navbar__logo-img" />
          <div className="navbar__brand-text">
            <span className="navbar__brand-title" style={{ color: "#002868", fontWeight: 800, fontSize: "1.15rem" }}>TCET</span>
            <span className="navbar__brand-sub" style={{ color: "#6B7280", letterSpacing: "0.06em", fontSize: "0.68rem", fontWeight: 600 }}>MULTICON - W</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <NavLinks role={claims?.role} />

        {/* Auth Actions */}
        <div className="navbar__actions">
          {claims ? (
            <div className="navbar__user-menu">
              <span className="navbar__user-badge">
                <span style={{ fontSize: "0.8rem" }}>{claims.role === "admin" ? "🛡️" : "👤"}</span>
                <span className="navbar__user-name">{claims.role === "admin" ? "Admin" : "Contributor"}</span>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
