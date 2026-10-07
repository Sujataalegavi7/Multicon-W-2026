import { Readable } from "node:stream";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { getSession } from "./auth";
import { HttpError } from "./http";
import { getFileStream, statFile } from "./minio";
import { Paper } from "@/models/Paper";

/**
 * FR-DOC-02: approved papers are public; otherwise only the uploader or an admin.
 * Anyone else (including anonymous users) gets 403. Returns the storage key.
 */
export async function authorizeFile(id: string, kind: "pdf" | "thumb") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "File not found");
  await connectDB();
  const paper = await Paper.findById(id).lean();
  if (!paper) throw new HttpError(404, "File not found");

  const isPublic = paper.status === "approved";
  if (!isPublic) {
    const s = await getSession();
    if (!s || (s.role !== "admin" && String(paper.uploadedBy) !== s.id)) throw new HttpError(403, "Forbidden");
  }
  const key = kind === "pdf" ? paper.pdfKey : paper.thumbnailKey;
  if (!key) throw new HttpError(404, "File not found");
  return { key, isPublic, title: paper.title, contentType: kind === "pdf" ? "application/pdf" : paper.thumbnailType ?? "image/jpeg" };
}

const slug = (s: string) => s.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 80) || "paper";

/** Streams an object from MinIO to the client, honoring `Range: bytes=a-b` so PDF viewers can seek. */
export async function streamFromStorage(
  req: Request,
  file: { key: string; isPublic: boolean; contentType: string },
  opts: { filename?: string; download?: boolean } = {}
) {
  const stat = await statFile(file.key);
  const size = stat.size;
  const headers = new Headers({
    "Content-Type": file.contentType,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    // Public copies may be cached briefly; anything gated must never sit in a shared cache.
    "Cache-Control": file.isPublic ? "public, max-age=300" : "private, no-store",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  if (opts.filename) {
    headers.set("Content-Disposition", `${opts.download ? "attachment" : "inline"}; filename="${slug(opts.filename)}.pdf"`);
  }

  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (m && (m[1] || m[2])) {
    let start = m[1] ? parseInt(m[1], 10) : size - parseInt(m[2], 10);
    let end = m[1] && m[2] ? parseInt(m[2], 10) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const stream = await getFileStream(file.key, { offset: start, length: end - start + 1 });
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(Readable.toWeb(stream) as ReadableStream, { status: 206, headers });
  }

  const stream = await getFileStream(file.key);
  headers.set("Content-Length", String(size));
  return new Response(Readable.toWeb(stream) as ReadableStream, { status: 200, headers });
}
