"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Share2 } from "lucide-react";
import CitationModal from "@/components/CitationModal";

type Props = {
  paperId: string;
  paperTitle: string;
  authors: string[];
  conferenceName: string;
  citations: { apa: string; mla: string; ieee: string; bibtex: string };
};

export default function PaperActions({ paperId, paperTitle, authors, conferenceName, citations }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="paper-detail__actions">
      <a
        href={`/files/pdf/${paperId}?download=1`}
        className="btn btn-action paper-detail__action-btn"
      >
        <Download size={18} />
        <span>Download PDF</span>
      </a>

      <CitationModal
        citations={citations}
        paperTitle={paperTitle}
        authors={authors}
        conferenceName={conferenceName}
      />

      <button
        type="button"
        className="btn btn-outline paper-detail__action-btn paper-detail__action-btn--light"
        onClick={handleShare}
      >
        {copied ? (
          <>
            <Check size={16} />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={16} />
            <span>Share</span>
          </>
        )}
      </button>

      <Link href="/search" className="btn btn-outline paper-detail__action-btn paper-detail__action-btn--light">
        <ArrowLeft size={16} />
        <span>Back to Search</span>
      </Link>
    </div>
  );
}
