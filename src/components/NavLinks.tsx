"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ role }: { role?: string }) {
  const pathname = usePathname();

  return (
    <nav className="navbar__nav" aria-label="Main navigation">
      <Link
        href="/"
        className="navbar__link"
        style={pathname === "/" ? { fontWeight: 600, color: "#1F2937" } : {}}
      >
        Home
      </Link>
      <Link
        href="/search"
        className="navbar__link"
        style={
          pathname.startsWith("/search")
            ? {
                background: "#FDF2F4",
                color: "#C41230",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "6px 14px",
              }
            : {}
        }
      >
        Browse Papers
      </Link>
      {role === "admin" && (
        <Link
          href="/admin"
          className="navbar__link"
          style={
            pathname.startsWith("/admin")
              ? {
                  background: "#FDF2F4",
                  color: "#C41230",
                  fontWeight: 600,
                  borderRadius: "8px",
                  padding: "6px 14px",
                }
              : {}
          }
        >
          Admin Panel
        </Link>
      )}
      {role === "contributor" && (
        <Link
          href="/dashboard"
          className="navbar__link"
          style={
            pathname.startsWith("/dashboard")
              ? {
                  background: "#FDF2F4",
                  color: "#C41230",
                  fontWeight: 600,
                  borderRadius: "8px",
                  padding: "6px 14px",
                }
              : {}
          }
        >
          My Dashboard
        </Link>
      )}
    </nav>
  );
}
