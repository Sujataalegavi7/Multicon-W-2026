import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ExternalLink, User } from "lucide-react";
import PaperActions from "./PaperActions";
import { allCitations } from "@/lib/citations";
import { getApprovedPaper, getRelated, paperYear } from "@/lib/papers";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

const load = async (id: string) => (mongoose.isValidObjectId(id) ? getApprovedPaper(id) : null);
const base = () => (process.env.APP_URL ?? "http://localhost").replace(/\/$/, "");

/** Highwire Press tags (FR-SEO-01). Rendered server-side so crawlers see them without running JS. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await load(id);
  if (!p) return { title: "Paper not found" };

  const parsed = Date.parse(p.conferenceDate);
  const date = new Date(Number.isNaN(parsed) ? p.createdAt : parsed);
  const other: Record<string, string | string[]> = {
    citation_title: p.title,
    citation_author: p.authors,
    citation_publication_date: `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`,
    citation_conference_title: p.conferenceName,
    citation_pdf_url: `${base()}/files/pdf/${p.id}`,
  };
  if (p.doi) other.citation_doi = p.doi;
  const isbn = p.electronicISBN || p.printISBN;
  if (isbn) other.citation_isbn = isbn;
  if (p.keywords.length) other.citation_keywords = p.keywords.join("; ");

  return { title: `${p.title} · TCET CRR`, description: p.abstract.slice(0, 160), other };
}

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const paper = await load(id);
  if (!paper) notFound();
  const [related, citations] = await Promise.all([getRelated(paper), Promise.resolve(allCitations(paper))]);

  const pdfUrl = `/files/pdf/${paper.id}`;

  return (
    <div className="paper-detail-page">
      {/* Dark hero banner header */}
      <div className="paper-detail__hero">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <Link href="/search">Repository</Link>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">{paper.title}</span>
          </nav>

          {/* Conference tag */}
          {paper.conferenceName && (
            <div className="paper-detail__conference-tag">
              <span className="paper-detail__conf-pill">
                🏛️ {paper.conferenceName}
                {paper.conferenceDate && ` · ${paper.conferenceDate}`}
                {paper.conferenceLocation && ` · ${paper.conferenceLocation}`}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="paper-detail__title">{paper.title}</h1>

          {/* Authors */}
          {paper.authors.length > 0 && (
            <div className="paper-detail__authors">
              {paper.authors.map((a, i) => (
                <span key={i} className="paper-detail__author">
                  <User size={13} style={{ marginRight: 6 }} />
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <PaperActions
            paperId={paper.id}
            paperTitle={paper.title}
            authors={paper.authors}
            conferenceName={paper.conferenceName}
            citations={citations}
          />
        </div>
      </div>

      {/* Body content */}
      <div className="container">
        <div className="paper-detail__layout">
          {/* Main Column */}
          <div className="paper-detail__main">
            {/* Abstract */}
            <div className="card paper-detail__card">
              <div className="paper-detail__section">
                <h2 className="paper-detail__section-title">Abstract</h2>
                <p className="paper-detail__abstract">{paper.abstract}</p>
              </div>

              {/* Keywords */}
              {paper.keywords.length > 0 && (
                <div className="paper-detail__section" style={{ marginBottom: 0 }}>
                  <h2 className="paper-detail__section-title">Keywords</h2>
                  <div className="paper-detail__keywords">
                    {paper.keywords.map((kw, i) => (
                      <Link
                        key={i}
                        href={`/search?keyword=${encodeURIComponent(kw)}`}
                        className="paper-card__keyword"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview */}
            <div className="card paper-detail__card">
              <div className="paper-detail__section" style={{ marginBottom: 0 }}>
                <div className="paper-detail__pdf-header">
                  <h2 className="paper-detail__section-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
                    Document Preview
                  </h2>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm paper-detail__pdf-open-btn"
                  >
                    <ExternalLink size={14} />
                    <span>Open in New Tab</span>
                  </a>
                </div>

                <div className="paper-detail__pdf-wrap">
                  <iframe
                    src={`${pdfUrl}#view=FitH`}
                    title={`PDF preview: ${paper.title}`}
                    className="paper-detail__pdf"
                    aria-label="Paper PDF preview"
                  />
                </div>

                <div className="paper-detail__pdf-mobile-hint">
                  <span>Having trouble viewing on mobile?</span>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    Open PDF Directly
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="paper-detail__sidebar">
            {/* Publication Details */}
            <div className="paper-detail__info-card">
              <h3 className="paper-detail__info-title">Publication Details</h3>
              <dl className="paper-detail__dl">
                {paper.doi && (
                  <>
                    <dt>DOI</dt>
                    <dd>
                      <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">
                        {paper.doi}
                      </a>
                    </dd>
                  </>
                )}
                {paper.conferenceName && (
                  <>
                    <dt>Conference</dt>
                    <dd>{paper.conferenceName}</dd>
                  </>
                )}
                {paper.conferenceDate && (
                  <>
                    <dt>Date</dt>
                    <dd>{paper.conferenceDate}</dd>
                  </>
                )}
                {paper.conferenceLocation && (
                  <>
                    <dt>Location</dt>
                    <dd>{paper.conferenceLocation}</dd>
                  </>
                )}
                {paper.electronicISBN && (
                  <>
                    <dt>E-ISBN</dt>
                    <dd>{paper.electronicISBN}</dd>
                  </>
                )}
                {paper.printISBN && (
                  <>
                    <dt>Print ISBN</dt>
                    <dd>{paper.printISBN}</dd>
                  </>
                )}
                {paper.createdAt && (
                  <>
                    <dt>Added</dt>
                    <dd>
                      {new Date(paper.createdAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            {/* Related Research */}
            {related.length > 0 && (
              <div className="paper-detail__info-card">
                <h3 className="paper-detail__info-title">Related Research</h3>
                <div className="related-papers">
                  {related.map((rp) => (
                    <div key={rp.id} className="related-paper-item">
                      <Link href={`/papers/${rp.id}`} className="related-paper-item__title">
                        {rp.title}
                      </Link>
                      <p className="related-paper-item__authors">
                        {rp.authors?.join("; ")}
                      </p>
                      <p className="related-paper-item__conf">
                        {rp.conferenceName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
