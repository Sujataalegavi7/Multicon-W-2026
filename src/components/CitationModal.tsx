"use client";
import { useState } from "react";
import { Check, Copy, Download, Quote, X } from "lucide-react";

type Citations = { apa: string; mla: string; ieee: string; bibtex: string };

type Props = {
  citations: Citations;
  paperTitle: string;
  authors: string[];
  conferenceName: string;
};

export default function CitationModal({ citations, paperTitle, authors, conferenceName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"plaintext" | "bibtex" | "mla">("plaintext");
  const [plainTextStyle, setPlainTextStyle] = useState<"ieee" | "apa">("ieee");
  const [copied, setCopied] = useState(false);

  const getCitationText = () => {
    if (activeTab === "bibtex") return citations.bibtex;
    if (activeTab === "mla") return citations.mla;
    return plainTextStyle === "ieee" ? citations.ieee : citations.apa;
  };

  const currentText = getCitationText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const safeTitle = (paperTitle || "citation")
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");

    const isBib = activeTab === "bibtex";
    const filename = `${safeTitle}.${isBib ? "bib" : "txt"}`;
    const mimeType = isBib ? "application/x-bibtex;charset=utf-8" : "text/plain;charset=utf-8";

    const blob = new Blob([currentText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline paper-detail__action-btn paper-detail__action-btn--light"
        onClick={() => setIsOpen(true)}
      >
        <Quote size={16} />
        <span>Cite This</span>
      </button>

      {isOpen && (
        <div className="modal-overlay cite-modal__overlay" onClick={() => setIsOpen(false)}>
          <div
            className="modal cite-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cite-modal-title"
          >
            {/* Header */}
            <div className="cite-modal__header">
              <div className="cite-modal__header-left">
                <div className="cite-modal__icon-pill">
                  <Quote size={16} />
                </div>
                <div>
                  <span className="cite-modal__eyebrow">IEEE Xplore Compatible</span>
                  <h3 id="cite-modal-title" className="cite-modal__title">
                    Cite This Paper
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="cite-modal__close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close cite modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Paper Mini Context */}
            <div className="cite-modal__paper-info">
              <p className="cite-modal__paper-title">{paperTitle}</p>
              <p className="cite-modal__paper-meta">
                {authors.join(", ")} · {conferenceName}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="cite-modal__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "plaintext"}
                className={`cite-modal__tab ${activeTab === "plaintext" ? "cite-modal__tab--active" : ""}`}
                onClick={() => setActiveTab("plaintext")}
              >
                <span className="cite-modal__tab-label">Plain Text</span>
                <span className="cite-modal__tab-badge">IEEE / APA</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "bibtex"}
                className={`cite-modal__tab ${activeTab === "bibtex" ? "cite-modal__tab--active" : ""}`}
                onClick={() => setActiveTab("bibtex")}
              >
                <span className="cite-modal__tab-label">BibTeX</span>
                <span className="cite-modal__tab-badge">.bib</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "mla"}
                className={`cite-modal__tab ${activeTab === "mla" ? "cite-modal__tab--active" : ""}`}
                onClick={() => setActiveTab("mla")}
              >
                <span className="cite-modal__tab-label">MLA 9</span>
                <span className="cite-modal__tab-badge">Humanities</span>
              </button>
            </div>

            {/* Controls Bar */}
            {activeTab === "plaintext" && (
              <div className="cite-modal__controls">
                <div className="cite-modal__format-toggle">
                  <span className="cite-modal__control-label">Format Style:</span>
                  <div className="cite-modal__pill-group">
                    <button
                      type="button"
                      className={`cite-modal__pill-btn ${plainTextStyle === "ieee" ? "cite-modal__pill-btn--active" : ""}`}
                      onClick={() => setPlainTextStyle("ieee")}
                    >
                      IEEE Standard
                    </button>
                    <button
                      type="button"
                      className={`cite-modal__pill-btn ${plainTextStyle === "apa" ? "cite-modal__pill-btn--active" : ""}`}
                      onClick={() => setPlainTextStyle("apa")}
                    >
                      APA 7th
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Citation Preview Box */}
            <div className="cite-modal__body">
              <div className={`cite-modal__content-box ${activeTab === "bibtex" ? "cite-modal__content-box--code" : ""}`}>
                <pre className="cite-modal__pre">{currentText}</pre>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="cite-modal__footer">
              <div className="cite-modal__footer-left">
                <span className="cite-modal__hint">
                  {activeTab === "plaintext"
                    ? "Standard formatted reference for bibliographies."
                    : activeTab === "bibtex"
                    ? "Compatible with LaTeX and Overleaf bib managers."
                    : "Compatible with modern academic citation formats."}
                </span>
              </div>

              <div className="cite-modal__footer-actions">
                <button
                  type="button"
                  className={`btn btn-sm cite-modal__btn-copy ${copied ? "cite-modal__btn-copy--copied" : "btn-outline"}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check size={15} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-primary cite-modal__btn-download"
                  onClick={handleDownload}
                >
                  <Download size={15} />
                  <span>Download {activeTab === "bibtex" ? ".bib" : ".txt"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
