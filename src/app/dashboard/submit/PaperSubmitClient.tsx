"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, Pencil } from "lucide-react";
import PaperForm from "@/components/PaperForm";
import { api } from "@/lib/client";
import type { PaperView } from "@/lib/papers";

export default function PaperSubmitClient({ paperId }: { paperId?: string }) {
  const [paper, setPaper] = useState<PaperView | null>(null);
  const [loading, setLoading] = useState(!!paperId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paperId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    api<{ paper: PaperView }>(`/api/papers/${paperId}`)
      .then((res) => {
        if (isMounted) {
          setPaper(res.paper);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError((err as Error).message || "Failed to load manuscript details.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [paperId]);

  const editing = !!paperId;

  return (
    <div className="dashboard-page">
      <div className="container" style={{ maxWidth: 860 }}>
        {/* Navigation back to dashboard */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/dashboard"
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={15} />
            <span>Back to My Submissions</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="dashboard-card" style={{ marginBottom: 24, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: editing ? "#FEF3C7" : "#EFF6FF",
                color: editing ? "#D97706" : "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {editing ? <Pencil size={22} /> : <FileUp size={22} />}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "#002868",
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {editing ? "Edit Manuscript Details" : "Submit Manuscript for Review"}
              </h1>
              <p style={{ color: "#6B7280", fontSize: "0.88rem", marginTop: 4, marginBottom: 0 }}>
                {editing
                  ? "Update manuscript indexing metadata or replace the document file for editorial re-review."
                  : "Complete the metadata fields below and upload your manuscript PDF for editorial review."}
              </p>
            </div>
          </div>
        </div>

        {/* Loading state for edit mode */}
        {loading && (
          <div className="dashboard-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div className="loading-center">
              <span className="spinner" />
              <p style={{ marginTop: 12, fontSize: "0.9rem", color: "#6B7280" }}>
                Loading manuscript details...
              </p>
            </div>
          </div>
        )}

        {/* Error state if manuscript fetch fails */}
        {!loading && error && (
          <div className="dashboard-card" style={{ padding: "32px 28px" }}>
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>{error}</span>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#4B5563", marginBottom: 16 }}>
              The requested manuscript could not be found or you do not have permission to edit it.
            </p>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Return to Submissions Dashboard
            </Link>
          </div>
        )}

        {/* Form content */}
        {!loading && !error && (
          <div className="dashboard-card" style={{ padding: "28px" }}>
            <PaperForm paper={paper ?? undefined} />
          </div>
        )}
      </div>
    </div>
  );
}

