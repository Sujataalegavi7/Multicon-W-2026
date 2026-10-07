import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { PaperView, paperYear } from "@/lib/papers";

export default function PaperCard({ paper, index }: { paper: PaperView; index?: number }) {
  const variant = index !== undefined && index % 2 === 1 ? "paper-card--blue" : "";

  const authorStr = paper.authors.length > 3
    ? `${paper.authors.slice(0, 3).join("; ")}; et al.`
    : paper.authors.join("; ");

  const abstractPreview =
    paper.abstract && paper.abstract.length > 160
      ? `${paper.abstract.slice(0, 160)}…`
      : paper.abstract;

  return (
    <article className={`paper-card ${variant}`}>
      <div className="paper-card__inner">
        {/* Left thumb */}
        <div className="paper-card__thumb">
          {paper.hasThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/files/thumb/${paper.id}`}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px 0 0 12px" }}
            />
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke={variant ? "#003087" : "#C41230"} strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          )}
        </div>

        {/* Right content */}
        <div className="paper-card__content">
          {/* Meta row */}
          <div className="paper-card__meta">
            <span className="paper-card__conf-tag">{paper.conferenceName || "MULTICON-W"}</span>
            <span className="paper-card__year">{paperYear(paper)}</span>
            {paper.isFeatured && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#b45309", fontWeight: 600 }}>
                <Star size={12} fill="currentColor" /> Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="paper-card__title">
            <Link href={`/papers/${paper.id}`}>{paper.title}</Link>
          </h3>

          {/* Authors */}
          {authorStr && (
            <div className="paper-card__authors">
              <svg className="paper-card__author-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{authorStr}</span>
            </div>
          )}

          {/* Abstract */}
          {abstractPreview && (
            <p className="paper-card__abstract">{abstractPreview}</p>
          )}

          {/* Footer: keywords + location + link */}
          <div className="paper-card__footer">
            <div className="paper-card__keywords">
              {paper.keywords && paper.keywords.length > 0
                ? paper.keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="paper-card__keyword">{kw}</span>
                  ))
                : paper.conferenceLocation && (
                    <span className="paper-card__authors" style={{ marginBottom: 0 }}>
                      <MapPin size={12} style={{ color: "#9CA3AF" }} />
                      {paper.conferenceLocation}
                    </span>
                  )
              }
              {paper.doi && (
                <span className="mono" style={{ fontSize: "0.72rem" }}>DOI {paper.doi}</span>
              )}
            </div>
            <Link href={`/papers/${paper.id}`} className="paper-card__link">
              <span>View Details</span>
              <span className="paper-card__arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
