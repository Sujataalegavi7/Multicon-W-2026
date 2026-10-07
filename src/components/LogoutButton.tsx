"use client";

export default function LogoutButton() {
  return (
    <button
      className="btn btn-outline btn-sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Sign Out
    </button>
  );
}
