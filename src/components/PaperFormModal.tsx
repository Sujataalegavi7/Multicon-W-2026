"use client";
import Modal from "./Modal";
import PaperForm from "./PaperForm";
import type { PaperView } from "@/lib/papers";

export default function PaperFormModal({
  paper,
  onClose,
  onSaved,
}: {
  paper?: PaperView;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal
      title={paper ? "Edit Manuscript Details" : "Submit Manuscript for Review"}
      onClose={onClose}
      wide
    >
      <PaperForm
        paper={paper}
        onCancel={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}
