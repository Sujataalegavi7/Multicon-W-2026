import Link from "next/link";
import Image from "next/image";
import PaperCard from "@/components/PaperCard";
import { getFeatured, getFilterMeta, getPublicStats, searchPapers } from "@/lib/papers";

export const dynamic = "force-dynamic";
export const metadata = { title: "TCET Multicon-W Research Repository" };

export default async function Home() {
  const [featured, stats, meta, recentResult] = await Promise.all([
    getFeatured(4),
    getPublicStats(),
    getFilterMeta(),
    searchPapers({ sort: "newest", page: 1, limit: 4 }),
  ]);

  const recent = recentResult.papers;

  return (
    <>
      {/* ── Announcement Banner ─────────────────────────────────────────── */}
      <div className="announcement-bar">
        <div className="container announcement-bar__inner">
          <span className="announcement-bar__item">
            <span className="announcement-bar__dot" />
            AUTONOMOUS INSTITUTION
          </span>
          <span className="announcement-bar__divider">|</span>
          <span className="announcement-bar__item">
            <span className="announcement-bar__dot" />
            NAAC GRADE &apos;A&apos;
          </span>
          <span className="announcement-bar__divider">|</span>
          <span className="announcement-bar__item">
            <span className="announcement-bar__dot" />
            AFFILIATED TO UNIVERSITY OF MUMBAI
          </span>
          <span className="announcement-bar__divider">|</span>
          <span className="announcement-bar__item">
            <span className="announcement-bar__dot" />
            APPROVED BY AICTE
          </span>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-section__main">
          {/* Left */}
          <div className="hero-section__left">
            <p className="hero-section__eyebrow">
              Thakur College of Engineering &amp; Technology
            </p>
            <h1 className="hero-section__title">
              TCET
              <br />
              <span className="hero-section__title-red">Multicon W</span>
            </h1>
            <p className="hero-section__desc">
              Research, Dig, and Contribute to college-stage research
              publications, papers, and scholarly works from TCET&apos;s
              MULTICON-W conferences.
            </p>

            {/* Search */}
            <form action="/search" className="hero-section__search">
              <label htmlFor="hero-q" className="sr-only">Search</label>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input id="hero-q" name="q" placeholder="Search by title, author, keyword…" />
              <button type="submit">Search</button>
            </form>

            {/* Quick filters */}
            <div className="hero-section__pills">
              <Link href="/search" className="hero-section__pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                All Papers
              </Link>
              <Link href="/search?featured=true" className="hero-section__pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Featured
              </Link>
              {meta.years.length > 0 && (
                <Link href={`/search?year=${meta.years[0]}`} className="hero-section__pill">
                  📅 {meta.years[0]}
                </Link>
              )}
            </div>
          </div>

          {/* Right — dark stats card */}
          <div className="hero-section__right">
            <div className="hero-section__card">
              <div className="hero-section__card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="hero-section__card-title">
                {stats.papers}+ Research Papers
              </div>
              <div className="hero-section__card-divider" />
              <div className="hero-section__card-desc">
                Peer-reviewed papers from MULTICON-W conferences, available open-access to the academic community globally.
              </div>
              <Link href="/search" className="hero-section__card-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Browse Repository
              </Link>
            </div>

            {/* Mini stat cards */}
            <div className="hero-section__stat-cards">
              <div className="hero-section__stat-card">
                <div className="hero-section__stat-value">{stats.conferences}</div>
                <div className="hero-section__stat-label">Conference Series</div>
              </div>
              <div className="hero-section__stat-card">
                <div className="hero-section__stat-value">{meta.years.length}</div>
                <div className="hero-section__stat-label">Years Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About TCET & Multicon ────────────────────────────────────────── */}
      <section className="about-section">
        <div className="container about__grid">
          {/* Left — photo + panel */}
          <div className="about__card">
            <div className="about__card-dots">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className="about__dot-pixel" />
              ))}
            </div>
            <div className="about__photo-wrap">
              <Image
                src="/tcet-building.jpg"
                alt="TCET Campus"
                width={600}
                height={375}
                className="about__photo"
              />
            </div>
            <div className="about__card-panel">
              <div className="about__logo-badge">
                <Image src="/tcet-logo.png" alt="TCET Logo" width={40} height={40} className="about__logo-img" />
              </div>
              <div className="about__stats-row">
                <div className="about__stat">
                  <div className="about__stat-value">25+</div>
                  <div className="about__stat-label">Years of Excellence</div>
                </div>
                <div className="about__stat-divider" />
                <div className="about__stat">
                  <div className="about__stat-value">36+</div>
                  <div className="about__stat-label">Departments</div>
                </div>
                <div className="about__stat-divider" />
                <div className="about__stat">
                  <div className="about__stat-value">25,000+</div>
                  <div className="about__stat-label">Alumni Network</div>
                </div>
              </div>
            </div>
            <div className="about__card-circle" />
          </div>

          {/* Right — content */}
          <div className="about__content">
            <div className="section__eyebrow">MULTICON-W CONFERENCE</div>
            <h2 className="about__title">
              About TCET &amp;{" "}
              <span style={{ color: "#C41230" }}>Multicon</span>
            </h2>
            <div className="about__title-line" />
            <p className="about__desc">
              Thakur College of Engineering &amp; Technology (TCET) is a premier
              autonomous engineering institution in Mumbai. Devoted to academic rigor
              and technical innovation, TCET encourages faculty, scholars, and students
              to engage in high-impact research, development, and interdisciplinary
              collaboration.
            </p>

            <div className="about__features">
              <div className="about__feature">
                <div className="about__feature-icon about__feature-icon--red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className="about__feature-body">
                  <h4 className="about__feature-title">Discover Multicon &amp; Contribute</h4>
                  <p className="about__feature-desc">Explore Multicon&apos;s conferences, research initiatives, and opportunities to contribute to the academic community.</p>
                </div>
                <Link href="/search" className="about__feature-arrow" aria-label="Browse papers">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </div>

              <div className="about__feature">
                <div className="about__feature-icon about__feature-icon--blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="about__feature-body">
                  <h4 className="about__feature-title">TCET College &amp; Academics</h4>
                  <p className="about__feature-desc">Discover more about TCET, its academic programs, departments, campus, and commitment to excellence in education.</p>
                </div>
                <Link href="/search" className="about__feature-arrow" aria-label="Academic programs">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </div>

              <div className="about__feature">
                <div className="about__feature-icon about__feature-icon--red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16l.42.92z" />
                  </svg>
                </div>
                <div className="about__feature-body">
                  <h4 className="about__feature-title">Connect With Us</h4>
                  <p className="about__feature-desc">Have a question or want to get in touch? Find our contact details and connect with the Multicon team.</p>
                </div>
                <Link href="/login" className="about__feature-arrow" aria-label="Contact us">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Research Papers ─────────────────────────────────────── */}
      <section className="section section--papers">
        <div className="container">
          <div className="section__header--row" style={{ marginBottom: "32px" }}>
            <div>
              <div className="section__eyebrow">CURATED SELECTION</div>
              <h2 className="section__title">
                Featured <span className="section__title-red">Research Papers</span>
              </h2>
              <p className="section__subtitle">Highlighted publications from our academic contributors</p>
            </div>
            <Link href="/search?featured=true" className="section__action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Browse All Papers →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📄</div>
              <h3 className="empty-state__title">No research papers found</h3>
              <p className="empty-state__text">Papers will appear here once contributors begin publishing.</p>
            </div>
          ) : (
            <div className="papers-grid">
              {featured.map((p, i) => <PaperCard key={p.id} paper={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Recently Published ───────────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__header--row" style={{ marginBottom: "32px" }}>
            <div>
              <div className="section__eyebrow">LATEST ADDITIONS</div>
              <h2 className="section__title">
                Recently <span className="section__title-red">Published</span>
              </h2>
              <p className="section__subtitle">The newest papers added to our repository</p>
            </div>
            <Link href="/search?sort=newest" className="section__action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              View All New →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__text">No recent papers available.</p>
            </div>
          ) : (
            <div className="papers-grid">
              {recent.map((p, i) => <PaperCard key={p.id} paper={p} index={i + 1} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
