import { NextRequest } from "next/server";
import { handle } from "@/lib/http";
import { authorizeFile, streamFromStorage } from "@/lib/serve-file";

export const dynamic = "force-dynamic";

// Public-facing PDF URL (also what Highwire `citation_pdf_url` points to).
// Add ?download=1 to force a "save as" with a friendly filename.
export const GET = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const file = await authorizeFile(id, "pdf");
  return streamFromStorage(req, file, { filename: file.title, download: req.nextUrl.searchParams.get("download") === "1" });
});
