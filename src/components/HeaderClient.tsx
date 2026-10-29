"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import NavLinks from "./NavLinks";

interface HeaderClientProps {
  claims: {
    sub: string;
    role: "admin" | "contributor";
  } | null;
}

export default function HeaderClient({ claims }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const isHomeActive = pathname === "/";
  const isSearchActive = pathname.startsWith("/search");
  const isAdminActive = pathname.startsWith("/admin");
  const isDashboardActive = pathname.startsWith("/dashboard");

  return (
    <header className="navbar" ref={headerRef}>
      <div className="container navbar__inner">
        {/* Brand */}
        <Link href="/" className="navbar__brand" onClick={() => setIsOpen(false)}>
          <Image
            src="/tcet-logo.png"
            alt="TCET Logo"
            width={44}
            height={44}
            className="navbar__logo-img"
            priority
          />
          <div className="navbar__brand-text">
            <span
              className="navbar__brand-title"
              style={{ color: "#002868", fontWeight: 800, fontSize: "1.15rem" }}
            >
              TCET
            </span>
            <span
              className="navbar__brand-sub"
              style={{
                color: "#6B7280",
                letterSpacing: "0.06em",
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              MULTICON - W QUALITY PAPERS
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <NavLinks role={claims?.role} />

        {/* Auth Actions (Desktop) */}
        <div className="navbar__actions">
          {claims ? (
            <div className="navbar__user-menu">
              <span className="navbar__user-badge">
                <span style={{ fontSize: "0.8rem" }}>
                  {claims.role === "admin" ? "🛡️" : "👤"}
                </span>
                <span className="navbar__user-name">
                  {claims.role === "admin" ? "Admin" : "Contributor"}
                </span>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Log In</span>
            </Link>
          )}
        </div>

        {/* Hamburger Toggle Button (Mobile) */}
        <button
          type="button"
          className={`navbar__hamburger ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <nav
          id="mobile-navigation"
          className="navbar__mobile-menu"
          aria-label="Mobile navigation"
        >
          <Link
            href="/"
            className={`navbar__mobile-link ${isHomeActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            href="/search"
            className={`navbar__mobile-link ${isSearchActive ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span>Browse Papers</span>
          </Link>

          {claims?.role === "admin" && (
            <Link
              href="/admin"
              className={`navbar__mobile-link ${isAdminActive ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <span>Admin Panel</span>
            </Link>
          )}

          {claims?.role === "contributor" && (
            <Link
              href="/dashboard"
              className={`navbar__mobile-link ${isDashboardActive ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span>My Dashboard</span>
            </Link>
          )}

          <div className="navbar__mobile-divider" />

          {claims ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="navbar__mobile-user">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {claims.role === "admin" ? "🛡️" : "👤"}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1F2937" }}>
                      {claims.role === "admin" ? "Administrator" : "Contributor"}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#6B7280" }}>
                      Signed In
                    </div>
                  </div>
                </div>
                <span
                  className="navbar__user-badge"
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    textTransform: "capitalize",
                  }}
                >
                  {claims.role}
                </span>
              </div>

              <button
                type="button"
                className="navbar__mobile-link navbar__mobile-logout"
                onClick={handleLogout}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "4px",
                padding: "10px 16px",
                gap: "8px",
              }}
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Log In</span>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}