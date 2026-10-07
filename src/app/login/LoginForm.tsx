"use client";
import { useState } from "react";
import Image from "next/image";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"contributor" | "admin">("contributor");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: fd.get("identifier"), password: fd.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? "Login failed"); setBusy(false); return; }
    window.location.href = next || (data.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="login-card">
      {/* Header */}
      <div className="login-card__header">
        <Image src="/tcet-logo.png" alt="TCET Logo" width={52} height={52} className="login-card__logo" />
        <div className="login-card__title">TCET Research Repository</div>
        <div className="login-card__sub">MULTICON-W Conference Papers · Secure Access</div>
      </div>

      {/* Body */}
      <div className="login-card__body">
        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-toggle__btn ${mode === "contributor" ? "mode-toggle__btn--active" : ""}`}
            onClick={() => setMode("contributor")}
          >
            👤 Contributor
          </button>
          <button
            type="button"
            className={`mode-toggle__btn ${mode === "admin" ? "mode-toggle__btn--active" : ""}`}
            onClick={() => setMode("admin")}
          >
            🛡️ Administrator
          </button>
        </div>

        <form onSubmit={submit}>
          {error && (
            <div role="alert" style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", background: "#FFF0F2", border: "1px solid #fecdd3", fontSize: "0.85rem", color: "#C41230" }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              {mode === "admin" ? "Administrator Login ID" : "Email Address"}
              <span className="required"> *</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mode === "admin"
                  ? <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>
                  : <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>
                }
              </svg>
              <input
                id="identifier"
                name="identifier"
                type={mode === "admin" ? "text" : "email"}
                required
                autoComplete="username"
                className="form-control"
                placeholder={mode === "admin" ? "Enter administrator ID" : "Enter your email address"}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="form-control"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary btn-auth-submit">
            {busy ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Authenticating…</span></>
            ) : (
              <><span>{mode === "admin" ? "Access Admin Console" : "Sign In"}</span><span>→</span></>
            )}
          </button>
        </form>
      </div>

      {/* Footer note */}
      <div className="login-card__footer">
        {mode === "contributor"
          ? "Only for TCET faculties and authorized contributors."
          : "Admin credentials are provisioned during institutional deployment."}
      </div>
    </div>
  );
}
