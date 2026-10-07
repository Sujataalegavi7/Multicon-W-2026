"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  KeyRound,
  Search,
  Star,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { api, fmtDate, json } from "@/lib/client";
import type { PaperView } from "@/lib/papers";

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  contributors: number;
};
type Contributor = {
  id: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  papers: number;
  approved: number;
};
type LogRow = {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  paper: string | null;
};
type Tab = "papers" | "contributors" | "logs";

const STATUS_TABS = [
  ["", "All Papers"],
  ["pending", "Pending"],
  ["changes_requested", "Changes Requested"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
] as const;

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>("papers");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [paperFilter, setPaperFilter] = useState("pending");

  const loadStats = useCallback(
    () =>
      api<Stats>("/api/admin/stats")
        .then(setStats)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleStatClick = (t: Tab, filter?: string) => {
    setTab(t);
    if (filter !== undefined) setPaperFilter(filter);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Banner */}
        <div className="dashboard-banner">
          <div className="dashboard-banner__inner">
            <div className="dashboard-banner__user">
              <div className="dashboard-banner__avatar">AD</div>
              <div>
                <div
                  className="dashboard-banner__role-pill"
                  style={{
                    background: "rgba(196, 18, 48, 0.15)",
                    borderColor: "rgba(196, 18, 48, 0.3)",
                  }}
                >
                  <span
                    className="dashboard-banner__role-dot"
                    style={{ background: "#C41230" }}
                  />
                  <span>Chief Administrator</span>
                </div>
                <h1 className="dashboard-banner__title">Repository Command Center</h1>
                <p className="dashboard-banner__email">
                  Editorial moderation, peer-review oversight &amp; contributor management
                </p>
              </div>
            </div>

            <div className="dashboard-banner__actions">
              <button
                type="button"
                className="btn btn-primary dashboard-banner__btn"
                onClick={() => {
                  setTab("papers");
                  setPaperFilter("pending");
                }}
              >
                <Clock size={18} />
                <span>Review Pending Queue ({stats?.pending ?? 0})</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error dashboard-toast" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="dashboard-toast__close"
              onClick={() => setError("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="dashboard-stats-row">
          <div
            className={`dashboard-stat-card ${tab === "papers" && paperFilter === "" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => handleStatClick("papers", "")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--blue">
              <FileText size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Total Papers</span>
              <span className="dashboard-stat-card__value">{stats?.total ?? "–"}</span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${tab === "papers" && paperFilter === "pending" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => handleStatClick("papers", "pending")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--amber">
              <Clock size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Pending Review</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--amber">
                {stats?.pending ?? "–"}
              </span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${tab === "papers" && paperFilter === "approved" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => handleStatClick("papers", "approved")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--green">
              <CheckCircle2 size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Approved &amp; Live</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--green">
                {stats?.approved ?? "–"}
              </span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${tab === "papers" && paperFilter === "rejected" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => handleStatClick("papers", "rejected")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--red">
              <AlertTriangle size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Rejected</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--red">
                {stats?.rejected ?? "–"}
              </span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${tab === "contributors" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => handleStatClick("contributors")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--purple">
              <Users size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Contributors</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--purple">
                {stats?.contributors ?? "–"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="dashboard-nav-tabs">
          <button
            type="button"
            className={`dashboard-nav-tab ${tab === "papers" ? "active" : ""}`}
            onClick={() => setTab("papers")}
          >
            <span>Moderation Queue</span>
            {stats?.pending ? (
              <span className="dashboard-nav-tab__count">{stats.pending}</span>
            ) : null}
          </button>

          <button
            type="button"
            className={`dashboard-nav-tab ${tab === "contributors" ? "active" : ""}`}
            onClick={() => setTab("contributors")}
          >
            <span>Contributor Accounts</span>
            {stats?.contributors ? (
              <span className="dashboard-nav-tab__count">{stats.contributors}</span>
            ) : null}
          </button>

          <button
            type="button"
            className={`dashboard-nav-tab ${tab === "logs" ? "active" : ""}`}
            onClick={() => setTab("logs")}
          >
            <span>System Audit Log</span>
          </button>
        </div>

        {/* Tab Views */}
        {tab === "papers" && (
          <PapersTab
            initialStatus={paperFilter}
            onChange={loadStats}
          />
        )}
        {tab === "contributors" && <ContributorsTab onChange={loadStats} />}
        {tab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}

function PapersTab({
  initialStatus,
  onChange,
}: {
  initialStatus: string;
  onChange: () => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    papers: PaperView[];
    total: number;
    pages: number;
  } | null>(null);
  const [review, setReview] = useState<PaperView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(initialStatus);
    setPage(1);
  }, [initialStatus]);

  const load = useCallback(() => {
    const sp = new URLSearchParams({ page: String(page) });
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    api<typeof data>(`/api/admin/papers?${sp}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [status, q, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function toggleFeatured(p: PaperView) {
    try {
      await api(`/api/papers/${p.id}/featured`, { method: "PATCH" });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const done = () => {
    setReview(null);
    load();
    onChange();
  };

  return (
    <div>
      {/* Search and Filter toolbar */}
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="dashboard-filter-toolbar">
          <div className="dashboard-search-wrap">
            <Search className="dashboard-search-icon" size={16} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, author, conference…"
              className="dashboard-search-input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setStatus(v);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  status === v
                    ? "bg-[#C41230] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}

      {/* Papers Table Card */}
      <div className="dashboard-card">
        <div className="dashboard-card__header">
          <div>
            <h2 className="dashboard-card__title">Moderation Queue</h2>
            <p className="dashboard-card__subtitle">
              Showing {data?.papers.length ?? 0} of {data?.total ?? 0} papers
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Paper Title &amp; Conference</th>
                <th>Contributor</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!data && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="loading-center">
                      <span className="spinner" />
                      <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#6B7280" }}>
                        Loading queue…
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {data && data.papers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div className="empty-state">
                      <div className="empty-state__icon" style={{ margin: "0 auto 12px" }}>
                        <FileText size={32} />
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                        No papers found
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "#6B7280", maxWidth: 360, margin: "0 auto" }}>
                        No manuscripts match the selected status filter or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {data?.papers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="dashboard-paper-cell">
                      <span className="dashboard-paper-title">{p.title}</span>
                      <div className="dashboard-paper-authors">
                        {p.authors.join(", ")}
                      </div>
                      <span className="dashboard-table__conf-text">
                        🏛️ {p.conferenceName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">
                      {p.uploadedBy?.name || "Anonymous"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.uploadedBy?.email}
                      {p.uploadedBy?.department ? ` · ${p.uploadedBy.department}` : ""}
                    </div>
                  </td>
                  <td>
                    <span className="dashboard-table__date-text">{fmtDate(p.createdAt)}</span>
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="dashboard-table__actions" style={{ justifyContent: "flex-end" }}>
                      <a
                        className="btn btn-outline btn-sm"
                        href={`/files/pdf/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview PDF in new tab"
                      >
                        <ExternalLink size={14} />
                      </a>

                      {p.status === "approved" && (
                        <button
                          type="button"
                          className={`featured-toggle-btn ${p.isFeatured ? "featured-toggle-btn--active" : ""}`}
                          title={p.isFeatured ? "Unfeature from homepage" : "Feature on homepage carousel"}
                          onClick={() => toggleFeatured(p)}
                        >
                          <Star
                            size={14}
                            className={p.isFeatured ? "fill-amber-500 text-amber-500" : "text-gray-400"}
                          />
                          <span className="featured-toggle-text">
                            {p.isFeatured ? "Featured" : "Feature"}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setReview(p)}
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="pagination" style={{ margin: "20px 0" }}>
            <button
              className="pagination__btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="pagination__info">
              Page {page} of {data.pages}
            </span>
            <button
              className="pagination__btn"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {review && (
        <ReviewModal paper={review} onClose={() => setReview(null)} onDone={done} />
      )}
    </div>
  );
}

function ReviewModal({
  paper,
  onClose,
  onDone,
}: {
  paper: PaperView;
  onClose: () => void;
  onDone: () => void;
}) {
  const [remarks, setRemarks] = useState(paper.adminRemarks ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isFeatured, setIsFeatured] = useState(paper.isFeatured ?? false);

  async function toggleFeatured() {
    try {
      await api(`/api/papers/${paper.id}/featured`, { method: "PATCH" });
      setIsFeatured(!isFeatured);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function decide(status: string) {
    if ((status === "rejected" || status === "changes_requested") && !remarks.trim()) {
      return setError("Please provide editorial remarks explaining the decision to the author.");
    }
    setBusy(true);
    setError("");
    try {
      await api(`/api/papers/${paper.id}`, json("PATCH", { status, remarks }));
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal review-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Header */}
        <div className="review-modal__header">
          <div className="review-modal__header-info">
            <span className="review-modal__badge">Editorial Peer Review</span>
            <h3 id="review-modal-title" className="review-modal__title">
              {paper.title}
            </h3>
          </div>
          <button
            type="button"
            className="review-modal__close"
            onClick={onClose}
            aria-label="Close review modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="review-modal__body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>{error}</span>
            </div>
          )}

          {/* Contributor Bar */}
          <div className="review-modal__contributor-bar">
            <div className="review-modal__contributor-info">
              <div className="dashboard-banner__avatar" style={{ width: 40, height: 40, fontSize: "0.85rem" }}>
                <User size={18} />
              </div>
              <div>
                <span className="review-modal__author-name">
                  Submitted by {paper.uploadedBy?.name || "Contributor"}
                </span>
                <span className="review-modal__author-email">
                  {paper.uploadedBy?.email} {paper.uploadedBy?.department ? ` · ${paper.uploadedBy.department}` : ""}
                </span>
              </div>
            </div>

            <div className="review-modal__status-wrap">
              <StatusBadge status={paper.status} />
            </div>
          </div>

          {/* Featured Toggle Bar */}
          {paper.status === "approved" && (
            <div
              className={`review-modal__featured-bar ${isFeatured ? "review-modal__featured-bar--active" : ""}`}
              style={{ marginBottom: 18 }}
            >
              <label className="review-modal__featured-label">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={toggleFeatured}
                  className="review-modal__featured-checkbox"
                />
                <Star
                  size={18}
                  className={isFeatured ? "fill-amber-500 text-amber-500" : "text-gray-400"}
                />
                <span className="review-modal__featured-text">
                  Feature on Homepage Hero &amp; Curated Grid
                </span>
              </label>
              <span className="review-modal__featured-status">
                {isFeatured ? "Currently Featured" : "Standard Archive"}
              </span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="review-modal__meta-grid">
            <div className="review-modal__meta-item">
              <span className="review-modal__meta-label">Conference</span>
              <span className="review-modal__meta-val">{paper.conferenceName}</span>
            </div>
            {paper.conferenceDate && (
              <div className="review-modal__meta-item">
                <span className="review-modal__meta-label">Date / Year</span>
                <span className="review-modal__meta-val">{paper.conferenceDate}</span>
              </div>
            )}
            {paper.conferenceLocation && (
              <div className="review-modal__meta-item">
                <span className="review-modal__meta-label">Location</span>
                <span className="review-modal__meta-val">{paper.conferenceLocation}</span>
              </div>
            )}
            {paper.doi && (
              <div className="review-modal__meta-item">
                <span className="review-modal__meta-label">DOI</span>
                <span className="review-modal__meta-val font-mono">{paper.doi}</span>
              </div>
            )}
            {(paper.electronicISBN || paper.printISBN) && (
              <div className="review-modal__meta-item">
                <span className="review-modal__meta-label">ISBN</span>
                <span className="review-modal__meta-val font-mono">
                  {paper.electronicISBN || paper.printISBN}
                </span>
              </div>
            )}
          </div>

          {/* Authors */}
          <div className="review-modal__section">
            <div className="review-modal__meta-label" style={{ marginBottom: 6 }}>Authors</div>
            <div className="review-modal__authors">
              {paper.authors.map((a, i) => (
                <span key={i} className="paper-detail__author" style={{ background: "#F3F4F6", color: "#1F2937", border: "1px solid #E5E7EB" }}>
                  <User size={13} style={{ marginRight: 6 }} />
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div className="review-modal__section">
            <div className="review-modal__meta-label" style={{ marginBottom: 6 }}>Abstract</div>
            <p className="review-modal__abstract">{paper.abstract}</p>
          </div>

          {/* Keywords */}
          {paper.keywords.length > 0 && (
            <div className="review-modal__section">
              <div className="review-modal__meta-label" style={{ marginBottom: 6 }}>Keywords</div>
              <div className="review-modal__keywords">
                {paper.keywords.map((kw, i) => (
                  <span key={i} className="paper-card__keyword">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Preview Section */}
          <div className="review-modal__pdf-section">
            <div className="review-modal__pdf-header">
              <span className="review-modal__pdf-title">Full Manuscript PDF Preview</span>
              <a
                href={`/files/pdf/${paper.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm review-modal__pdf-actions"
              >
                <ExternalLink size={14} />
                <span>Open in Tab</span>
              </a>
            </div>

            <div className="review-modal__pdf-container">
              <iframe
                src={`/files/pdf/${paper.id}#view=FitH`}
                title={`PDF preview: ${paper.title}`}
                className="review-modal__pdf-iframe"
              />
            </div>
          </div>

          {/* Remarks Section */}
          <div className="review-modal__remarks-section">
            <label className="form-label" htmlFor="review-remarks">
              Editorial Remarks &amp; Feedback{" "}
              <span className="text-gray-400 font-normal">(Required for Reject / Request Changes)</span>
            </label>
            <textarea
              id="review-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add editorial notes, revision requirements, or rationale for this decision…"
              className="form-control"
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ margin: "0 24px 12px" }}>
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="review-modal__footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>

          <div className="review-modal__action-buttons">
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: "#C41230", borderColor: "#fecdd3" }}
              disabled={busy}
              onClick={() => decide("rejected")}
            >
              <X size={15} />
              <span>Reject Manuscript</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ color: "#D97706", borderColor: "#fde68a" }}
              disabled={busy}
              onClick={() => decide("changes_requested")}
            >
              <AlertTriangle size={15} />
              <span>Request Changes</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ background: "#059669", borderColor: "#059669" }}
              disabled={busy}
              onClick={() => decide("approved")}
            >
              <CheckCircle2 size={16} />
              <span>Approve &amp; Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributorsTab({ onChange }: { onChange: () => void }) {
  const [list, setList] = useState<Contributor[] | null>(null);
  const [create, setCreate] = useState(false);
  const [reset, setReset] = useState<Contributor | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      api<{ contributors: Contributor[] }>("/api/admin/contributors")
        .then((d) => setList(d.contributors))
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(c: Contributor) {
    try {
      await api(
        `/api/admin/contributors/${c.id}`,
        json("PATCH", { isActive: !c.isActive })
      );
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <h2 className="dashboard-card__title">Registered Contributors</h2>
            <p className="dashboard-card__subtitle">
              Manage researcher accounts, department affiliations, and publication permissions
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreate(true)}
          >
            <UserPlus size={16} />
            <span>Add New Contributor</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-card">
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Contributor Name &amp; Email</th>
                <th>Department</th>
                <th>Submissions</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!list && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="loading-center">
                      <span className="spinner" />
                      <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#6B7280" }}>
                        Loading contributors…
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {list && list.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                      No contributor accounts registered yet.
                    </p>
                  </td>
                </tr>
              )}
              {list?.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-700">{c.department || "–"}</span>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-gray-900">
                      {c.approved} / {c.papers} approved
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="dashboard-table__actions" style={{ justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Reset password"
                        onClick={() => setReset(c)}
                      >
                        <KeyRound size={14} />
                        <span>Reset PW</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline btn-sm ${
                          c.isActive
                            ? "text-red-700 border-red-200 hover:bg-red-50"
                            : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        }`}
                        title={c.isActive ? "Deactivate account" : "Reactivate account"}
                        onClick={() => toggle(c)}
                      >
                        {c.isActive ? <Ban size={14} /> : <Check size={14} />}
                        <span>{c.isActive ? "Deactivate" : "Activate"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {create && (
        <CreateContributor
          onClose={() => setCreate(false)}
          onDone={() => {
            setCreate(false);
            load();
            onChange();
          }}
        />
      )}

      {reset && (
        <ResetPassword
          c={reset}
          onClose={() => setReset(null)}
          onDone={() => setReset(null)}
        />
      )}
    </div>
  );
}

function CreateContributor({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/api/admin/contributors", json("POST", fd));
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Register New Contributor" onClose={onClose}>
      <form onSubmit={submit} className="upload-form" noValidate>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="c-name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="c-name"
            name="name"
            required
            placeholder="e.g. Dr. Rajesh Sharma"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="c-email">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            placeholder="researcher@tcetmumbai.in"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="c-dept">
            Department / Faculty
          </label>
          <input
            id="c-dept"
            name="department"
            placeholder="e.g. Computer Engineering"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="c-pw">
            Initial Temporary Password <span className="required">*</span>
          </label>
          <input
            id="c-pw"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            className="form-control"
          />
          <span className="form-hint">The contributor can change this password after signing in.</span>
        </div>

        <div className="upload-form__actions" style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Creating…" : "Create Contributor Account"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPassword({
  c,
  onClose,
  onDone,
}: {
  c: Contributor;
  onClose: () => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    try {
      await api(`/api/admin/contributors/${c.id}`, json("PATCH", { password }));
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={`Reset Password · ${c.name}`} onClose={onClose}>
      <form onSubmit={submit} className="upload-form" noValidate>
        <p style={{ fontSize: "0.88rem", color: "#4B5563", marginBottom: 16 }}>
          Set a new password for <strong>{c.email}</strong>. All active sessions for this account will be invalidated immediately.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="r-pw">
            New Password <span className="required">*</span>
          </label>
          <input
            id="r-pw"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            className="form-control"
          />
        </div>

        <div className="upload-form__actions" style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Resetting…" : "Reset Password"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LogsTab() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ logs: LogRow[]; pages: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<typeof data>(`/api/admin/logs?page=${page}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page]);

  return (
    <div>
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="p-4">
          <h2 className="dashboard-card__title">System Audit Log</h2>
          <p className="dashboard-card__subtitle">
            Cryptographically tracked audit trail of all editorial decisions, status updates, and administrative activities
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-card">
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: "220px" }}>Timestamp</th>
                <th>Responsible User</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {!data && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="loading-center">
                      <span className="spinner" />
                      <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#6B7280" }}>
                        Loading audit trail…
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {data && data.logs.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>No audit log entries recorded yet.</p>
                  </td>
                </tr>
              )}
              {data?.logs.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="dashboard-table__date-text font-mono">
                      {new Date(l.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "medium",
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-semibold text-gray-900">{l.user}</span>
                  </td>
                  <td>
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 font-mono">
                      {l.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="pagination" style={{ margin: "20px 0" }}>
            <button
              className="pagination__btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Newer
            </button>
            <span className="pagination__info">
              Page {page} of {data.pages}
            </span>
            <button
              className="pagination__btn"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Older
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
