import { Suspense } from "react";
import PaperSubmitClient from "./PaperSubmitClient";

export const metadata = { title: "Submit Manuscript · TCET CRR" };

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="dashboard-page">
          <div className="container" style={{ maxWidth: 860, textAlign: "center", padding: "60px 0" }}>
            <span className="spinner" />
            <p style={{ marginTop: 12, color: "#6B7280" }}>Loading manuscript form...</p>
          </div>
        </div>
      }
    >
      <PaperSubmitClient paperId={id} />
    </Suspense>
  );
}

