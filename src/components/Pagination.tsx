import Link from "next/link";

export default function Pagination({ page, pages, params }: { page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `/search?${sp}`;
  };
  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
      {page > 1 ? <Link className="btn-ghost" href={href(page - 1)}>← Previous</Link> : <span className="btn-ghost opacity-40">← Previous</span>}
      <span className="text-slate-500">Page {page} of {pages}</span>
      {page < pages ? <Link className="btn-ghost" href={href(page + 1)}>Next →</Link> : <span className="btn-ghost opacity-40">Next →</span>}
    </nav>
  );
}
