import { z } from "zod";
import { HttpError } from "./http";

export const MAX_PDF = 25 * 1024 * 1024;
export const MAX_THUMB = 2 * 1024 * 1024;

const list = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))];
const str = (max: number) => z.string().trim().max(max);

export const metaSchema = z.object({
  title: str(300).min(1, "Title is required"),
  authors: str(1000).transform(list).refine((a) => a.length > 0, "At least one author is required"),
  abstract: str(10_000).min(1, "Abstract is required"),
  conferenceName: str(200).min(1, "Conference name is required"),
  conferenceDate: str(100).default(""),
  conferenceLocation: str(200).default(""),
  doi: str(200).default(""),
  electronicISBN: str(50).default(""),
  printISBN: str(50).default(""),
  keywords: str(1000).default("").transform(list),
});

/** Pull only the known text fields out of multipart form data. */
export function parseMeta(form: FormData) {
  const raw: Record<string, string> = {};
  for (const k of Object.keys(metaSchema.shape)) {
    const v = form.get(k);
    if (typeof v === "string") raw[k] = v;
  }
  return metaSchema.parse(raw);
}

export type ValidFile = { buffer: Buffer; contentType: string; ext: string };

const startsWith = (b: Buffer, sig: number[]) => sig.every((v, i) => b[i] === v);

/** Returns null if the field is absent/empty. Checks magic bytes, not just the client-declared MIME type. */
export async function readPdf(form: FormData): Promise<ValidFile | null> {
  const f = form.get("pdf");
  if (!(f instanceof File) || f.size === 0) return null;
  if (f.size > MAX_PDF) throw new HttpError(413, "PDF must be 25MB or smaller");
  const buffer = Buffer.from(await f.arrayBuffer());
  if (!startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) throw new HttpError(400, "File is not a valid PDF");
  return { buffer, contentType: "application/pdf", ext: "pdf" };
}

export async function readThumbnail(form: FormData): Promise<ValidFile | null> {
  const f = form.get("thumbnail");
  if (!(f instanceof File) || f.size === 0) return null;
  if (f.size > MAX_THUMB) throw new HttpError(413, "Thumbnail must be 2MB or smaller");
  const buffer = Buffer.from(await f.arrayBuffer());
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { buffer, contentType: "image/jpeg", ext: "jpg" };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47])) return { buffer, contentType: "image/png", ext: "png" };
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.subarray(8, 12).toString() === "WEBP") return { buffer, contentType: "image/webp", ext: "webp" };
  throw new HttpError(400, "Thumbnail must be a JPEG, PNG or WebP image");
}
