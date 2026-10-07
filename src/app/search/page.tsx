import { getFilterMeta, searchPapers, SearchParams } from "@/lib/papers";
import PaperCard from "@/components/PaperCard";
import Pagination from "@/components/Pagination";
import HeroSearchBar from "./HeroSearchBar";
import SearchFilterSidebar from "./SearchFilterSidebar";
import EmptyStateMagnifier from "./EmptyStateMagnifier";

export const dynamic = "force-dynamic";
export const metadata = { title: "Research Papers · TCET CRR" };

type Sp = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function SearchPage({ searchParams }: { searchParams: Sp }) {
  const sp = await searchParams;
  const f = {
    q: one(sp.q),
    conference: one(sp.conference),
    year: one(sp.year),
    author: one(sp.author),
    keyword: one(sp.keyword),
    featured: one(sp.featured),
    sort: one(sp.sort) || "newest",
  };
  const page = Number(one(sp.page)) || 1;

  const [result, meta] = await Promise.all([
    searchPapers({
      ...f,
      featured: f.featured === "true",
      sort: f.sort as SearchParams["sort"],
      page,
      limit: 10,
    }),
    getFilterMeta(),
  ]);

  return (
    <div>
      {/* ── Top Hero Banner (Matching Exact Reference) ──────────────── */}
      <section className="browse-hero">
        <div className="container browse-hero__inner">
          <div>
            <div className="browse-hero__eyebrow">MULTICON-W REPOSITORY</div>
            <h1 className="browse-hero__title">Research Papers</h1>
          </div>

          <HeroSearchBar initialQuery={f.q} />
        </div>
      </section>

      {/* ── Main Layout: Sidebar Filters + Results Card ─────────────── */}
      <main className="browse-main">
        <div className="container browse-grid">
          {/* Left: Filter Results Card */}
          <SearchFilterSidebar
            meta={meta}
            initialValues={{
              sort: f.sort,
              year: f.year,
              conference: f.conference,
              author: f.author,
              keyword: f.keyword,
            }}
          />

          {/* Right: All Research Papers Card */}
          <section className="search-results-card">
            {/* Header */}
            <div className="search-results-header">
              <h2 className="search-results-title">All Research Papers</h2>
              <span className="search-results-count">
                {result.total} {result.total === 1 ? "paper" : "papers"} found
              </span>
            </div>

            {/* Red accent divider underline */}
            <div className="search-results-accent" />

            {/* Content: Empty State or Papers List */}
            {result.papers.length === 0 ? (
              <div className="search-empty-wrap">
                <EmptyStateMagnifier />
                <h3 className="search-empty-title">No papers found</h3>
                <p className="search-empty-text">
                  Try adjusting your search query or clearing the filters.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {result.papers.map((p, i) => (
                  <PaperCard key={p.id} paper={p} index={(page - 1) * 10 + i} />
                ))}
                <div style={{ marginTop: "16px" }}>
                  <Pagination page={result.page} pages={result.pages} params={{ ...f }} />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
