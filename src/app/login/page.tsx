import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in · TCET CRR" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "";
  return (
    <div style={{ minHeight: "calc(100vh - 72px - 160px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", background: "#F9FAFB" }}>
      <LoginForm next={safe} />
    </div>
  );
}
