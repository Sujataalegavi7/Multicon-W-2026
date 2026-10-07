"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FileUp,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PaperFormModal from "@/components/PaperFormModal";
import { api, fmtDate } from "@/lib/client";
import type { PaperView } from "@/lib/papers";

export default function DashboardClient() {
  const [papers, setPapers] = useState<PaperView[] | null>(null);
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);
  const [modal, setModal] = useState<{ paper?: PaperView } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaperView | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const [me, list] = await Promise.all([
        api<{ user: { name: string; email?: string } }>("/api/auth/me"),
        api<{ papers: PaperView[] }>("/api/contributor/papers"),
      ]);
      setUser(me.user);
      setPapers(list.papers);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await api(`/api/papers/${deleteTarget.id}`, { method: "DELETE" });
      setSuccessMsg(`"${deleteTarget.title}" was deleted successfully.`);
      setDeleteTarget(null);
      load();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleteBusy(false);
    }
  }

  const count = (s: string) => papers?.filter((p) => p.status === s).length ?? 0;
  const needsAttentionCount =
    (papers?.filter((p) => p.status === "changes_requested").length ?? 0) +
    (papers?.filter((p) => p.status === "rejected").length ?? 0);

  const alerts =
    papers?.filter((p) => p.adminRemarks && (p.status === "changes_requested" || p.status === "rejected")) ?? [];

  // Filter papers
  const filteredPapers = (papers ?? []).filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchConf = p.conferenceName.toLowerCase().includes(q);
      const matchAuthor = p.authors.some((a) => a.toLowerCase().includes(q));
      if (!matchTitle && !matchConf && !matchAuthor) return false;
    }
    return true;
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-banner">
          <div className="dashboard-banner__inner">
            <div className="dashboard-banner__user">
              <div className="dashboard-banner__avatar">{getInitials(user?.name)}</div>
              <div>
                <div className="dashboard-banner__role-pill">
                  <span className="dashboard-banner__role-dot" />
                  <span>Verified Contributor</span>
                </div>
                <h1 className="dashboard-banner__title">
                  Welcome back, {user?.name || "Researcher"}
                </h1>
                {user?.email && <p className="dashboard-banner__email">{user.email}</p>}
              </div>
            </div>

            <div className="dashboard-banner__actions">
              <button
                type="button"
                className="btn btn-primary dashboard-banner__btn"
                onClick={() => setModal({})}
              >
                <FileUp size={18} />
                <span>Upload New Paper</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {successMsg && (
          <div className="alert alert-success dashboard-toast" role="alert">
            <span>{successMsg}</span>
            <button
              type="button"
              className="dashboard-toast__close"
              onClick={() => setSuccessMsg("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error dashboard-toast" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="dashboard-toast__close"
              onClick={() => setError("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Admin Remarks Notice Cards */}
        {alerts.map((p) => (
          <div
            key={p.id}
            className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm shadow-xs"
          >
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-900">
                {p.status === "rejected" ? "Manuscript Rejected" : "Revision Requested"}: {p.title}
              </p>
              <p className="mt-1 whitespace-pre-line text-amber-800">{p.adminRemarks}</p>
            </div>
            <button
              type="button"
              onClick={() => setModal({ paper: p })}
              className="btn btn-outline btn-sm shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100"
            >
              Edit &amp; Resubmit
            </button>
          </div>
        ))}

        {/* Metric Stats Row */}
        <div className="dashboard-stats-row">
          <div
            className={`dashboard-stat-card ${statusFilter === "" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => setStatusFilter("")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--blue">
              <FileText size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Total Submissions</span>
              <span className="dashboard-stat-card__value">{papers?.length ?? "–"}</span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${statusFilter === "approved" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "approved" ? "" : "approved")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--green">
              <CheckCircle2 size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Approved &amp; Published</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--green">
                {count("approved")}
              </span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${statusFilter === "pending" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "pending" ? "" : "pending")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--amber">
              <Clock size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Pending Review</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--amber">
                {count("pending")}
              </span>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${statusFilter === "changes_requested" ? "dashboard-stat-card--active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "changes_requested" ? "" : "changes_requested")}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--red">
              <AlertTriangle size={22} />
            </div>
            <div className="dashboard-stat-card__body">
              <span className="dashboard-stat-card__label">Needs Attention</span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--red">
                {needsAttentionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="dashboard-card" style={{ marginBottom: 20 }}>
          <div className="dashboard-filter-toolbar">
            <div className="dashboard-search-wrap">
              <Search className="dashboard-search-icon" size={16} />
              <input
                type="text"
                className="dashboard-search-input"
                placeholder="Filter by title, conference, or author…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                ["", "All Papers"],
                ["pending", "Pending"],
                ["approved", "Approved"],
                ["changes_requested", "Changes Requested"],
                ["rejected", "Rejected"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === key
                      ? "bg-[#C41230] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Papers Table Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">My Submitted Manuscripts</h2>
              <p className="dashboard-card__subtitle">
                Showing {filteredPapers.length} {filteredPapers.length === 1 ? "paper" : "papers"}
                {statusFilter ? ` (filter: ${statusFilter})` : ""}
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Manuscript Title &amp; Conference</th>
                  <th>Submitted</th>
                  <th>Editorial Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers === null && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      <div className="loading-center">
                        <span className="spinner" />
                        <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#6B7280" }}>
                          Loading submissions…
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {papers !== null && filteredPapers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div className="empty-state">
                        <div className="empty-state__icon" style={{ margin: "0 auto 12px" }}>
                          <FileText size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                          No manuscripts found
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#6B7280", maxWidth: 360, margin: "0 auto 16px" }}>
                          {searchQuery || statusFilter
                            ? "Try adjusting your search query or status filter to see other papers."
                            : "You haven't submitted any papers yet. Submit your first academic manuscript to get started."}
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setModal({})}
                        >
                          Submit Manuscript
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredPapers.map((p) => (
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
                      <span className="dashboard-table__date-text">{fmtDate(p.createdAt)}</span>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="dashboard-table__actions" style={{ justifyContent: "flex-end" }}>
                        {p.status === "approved" ? (
                          <Link
                            href={`/papers/${p.id}`}
                            className="btn btn-outline btn-sm"
                            title="View public paper page"
                          >
                            <ExternalLink size={14} />
                            <span>View</span>
                          </Link>
                        ) : (
                          <a
                            href={`/files/pdf/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            title="Preview PDF document"
                          >
                            <ExternalLink size={14} />
                            <span>Preview</span>
                          </a>
                        )}

                        {p.status !== "approved" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Edit manuscript details"
                              onClick={() => setModal({ paper: p })}
                            >
                              <Pencil size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ color: "#C41230", borderColor: "#fecdd3" }}
                              title="Delete manuscript"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paper Form Modal */}
        {modal && (
          <PaperFormModal
            paper={modal.paper}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              setSuccessMsg(
                modal.paper
                  ? "Paper details updated and resubmitted for review."
                  : "Manuscript submitted successfully! It is now queued for administrative review."
              );
              load();
              setTimeout(() => setSuccessMsg(""), 6000);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
              <div className="modal-header">
                <h3 className="modal-title">Confirm Deletion</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDeleteTarget(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: "#374151", marginBottom: 12 }}>
                  Are you sure you want to permanently delete:
                </p>
                <p style={{ fontWeight: 700, color: "#111827", marginBottom: 16 }}>
                  "{deleteTarget.title}"?
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                  This action cannot be undone and will remove the manuscript and its PDF from the repository.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDelete}
                  disabled={deleteBusy}
                >
                  {deleteBusy ? "Deleting…" : "Delete Manuscript"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
