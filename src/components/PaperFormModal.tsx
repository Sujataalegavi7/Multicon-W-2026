"use client";
import { useRef, useState } from "react";
import { Check, FileText, UploadCloud } from "lucide-react";
import Modal from "./Modal";
import ChipInput from "./ChipInput";
import { api, fmtSize } from "@/lib/client";
import type { PaperView } from "@/lib/papers";

const MAX_PDF = 25 * 1024 * 1024;

export default function PaperFormModal({
  paper,
  onClose,
  onSaved,
}: {
  paper?: PaperView;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!paper;
  const [pdf, setPdf] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [abstractText, setAbstractText] = useState(paper?.abstract ?? "");
  const pdfInput = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined | null) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf"))
      return setError("Please choose a PDF file.");
    if (f.size > MAX_PDF) return setError("PDF must be 25MB or smaller.");
    setError("");
    setPdf(f);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing && !pdf) return setError("A PDF file is required.");
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.delete("pdf");
    if (pdf) fd.set("pdf", pdf);
    try {
      await api(editing ? `/api/papers/${paper!.id}` : "/api/papers", {
        method: editing ? "PUT" : "POST",
        body: fd,
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Manuscript Details" : "Submit Manuscript for Review"} onClose={onClose} wide>
      <form onSubmit={submit} className="upload-form" noValidate>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>{error}</span>
          </div>
        )}
        {editing && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <span>Saving changes will resubmit this paper to the editorial moderation queue as <strong>Pending</strong>.</span>
          </div>
        )}

        {/* Section 1: Paper Overview & Content */}
        <div className="form-card-section">
          <div className="form-card-section__header">
            <div className="form-card-section__badge">1</div>
            <div>
              <h3 className="form-card-section__title">Paper Overview &amp; Content</h3>
              <p className="form-card-section__desc">Provide the primary details about your academic manuscript.</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Paper Title <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={paper?.title}
              placeholder="e.g. Deep Learning Approaches for High-Resolution Satellite Imaging"
              className="form-control"
            />
          </div>

          <ChipInput
            name="authors"
            label="Authors * (press Enter or comma)"
            initial={paper?.authors}
            placeholder="Dr. R. Sharma, Prof. S. Patil"
          />

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="form-label" htmlFor="abstract" style={{ marginBottom: 0 }}>
                Abstract <span className="required">*</span>
              </label>
              <span className="form-hint" style={{ margin: 0 }}>{abstractText.length} characters</span>
            </div>
            <textarea
              id="abstract"
              name="abstract"
              required
              rows={5}
              value={abstractText}
              onChange={(e) => setAbstractText(e.target.value)}
              placeholder="Summarize the core objectives, methodology, experimental findings, and conclusion of the paper…"
              className="form-control"
            />
          </div>

          <ChipInput
            name="keywords"
            label="Keywords & Topic Tags"
            initial={paper?.keywords}
            placeholder="e.g. Machine Learning, Cloud Computing"
          />
        </div>

        {/* Section 2: Conference & Indexing Metadata */}
        <div className="form-card-section">
          <div className="form-card-section__header">
            <div className="form-card-section__badge form-card-section__badge--blue">2</div>
            <div>
              <h3 className="form-card-section__title">Conference &amp; Indexing Metadata</h3>
              <p className="form-card-section__desc">Conference name, year, location, and identifier codes.</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="conferenceName">
                Conference Name <span className="required">*</span>
              </label>
              <input
                id="conferenceName"
                name="conferenceName"
                type="text"
                required
                defaultValue={paper?.conferenceName}
                placeholder="e.g. MULTICON-W 2026"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="conferenceDate">
                Conference Date / Year
              </label>
              <input
                id="conferenceDate"
                name="conferenceDate"
                type="text"
                defaultValue={paper?.conferenceDate}
                placeholder="e.g. February 2026 or 2026"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="conferenceLocation">
              Conference Location
            </label>
            <input
              id="conferenceLocation"
              name="conferenceLocation"
              type="text"
              defaultValue={paper?.conferenceLocation}
              placeholder="e.g. Mumbai, India"
              className="form-control"
            />
          </div>

          <div className="form-grid-3" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="doi">DOI (Digital Object Identifier)</label>
              <input
                id="doi"
                name="doi"
                type="text"
                defaultValue={paper?.doi}
                placeholder="e.g. 10.1109/XXXX.2026"
                className="form-control font-mono"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="electronicISBN">Electronic ISBN (e-ISBN)</label>
              <input
                id="electronicISBN"
                name="electronicISBN"
                type="text"
                defaultValue={paper?.electronicISBN}
                placeholder="e.g. 978-1-5386-xxxx-x"
                className="form-control font-mono"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="printISBN">Print ISBN</label>
              <input
                id="printISBN"
                name="printISBN"
                type="text"
                defaultValue={paper?.printISBN}
                placeholder="e.g. 978-1-5386-xxxx-x"
                className="form-control font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Manuscript Document Files */}
        <div className="form-card-section">
          <div className="form-card-section__header">
            <div className="form-card-section__badge form-card-section__badge--green">3</div>
            <div>
              <h3 className="form-card-section__title">Manuscript &amp; Document Files</h3>
              <p className="form-card-section__desc">Upload your PDF manuscript document.</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              PDF Manuscript {editing ? "(leave empty to keep current)" : <span className="required">*</span>}
            </label>
            <div
              className={`file-dropzone ${pdf ? "file-dropzone--selected" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pick(e.dataTransfer.files[0]);
              }}
              onClick={() => pdfInput.current?.click()}
            >
              <input
                ref={pdfInput}
                type="file"
                accept="application/pdf"
                className="file-dropzone__input"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              <div className="file-dropzone__content">
                <div className="file-dropzone__icon file-dropzone__icon--red">
                  <FileText size={28} />
                </div>
                {pdf ? (
                  <div>
                    <div className="file-dropzone__filename">{pdf.name}</div>
                    <div className="file-dropzone__filesize">
                      {fmtSize(pdf.size)} · Ready to upload
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="file-dropzone__title">
                      {editing ? "Click to replace existing PDF" : "Choose PDF file or drag & drop"}
                    </div>
                    <div className="file-dropzone__subtitle">PDF files up to 25MB supported</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="upload-form__actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Processing...</span>
              </>
            ) : editing ? (
              <>
                <Check size={18} />
                <span>Save &amp; Resubmit Paper</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Submit Manuscript for Review</span>
              </>
            )}
          </button>

          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
