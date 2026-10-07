import type { QueryFilter } from "mongoose";
import { connectDB } from "./db";
import { escapeRegex } from "./http";
import { Paper, PaperDoc, Status } from "@/models/Paper";

/** What clients get to see. Note: pdfKey / thumbnailKey never leave the server. */
export type PaperView = {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  conferenceName: string;
  conferenceDate: string;
  conferenceLocation: string;
  doi: string;
  electronicISBN: string;
  printISBN: string;
  keywords: string[];
  pdfSize: number;
  hasThumbnail: boolean;
  status: Status;
  adminRemarks: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: { id: string; name: string; email?: string; department?: string };
};

type Populated = { _id: unknown; name?: string; email?: string; department?: string };

export function toView(p: PaperDoc & { uploadedBy: unknown }): PaperView {
  const u = p.uploadedBy as Populated | null;
  const populated = u && typeof u === "object" && "name" in u;
  return {
    id: String(p._id),
    title: p.title,
    authors: p.authors,
    abstract: p.abstract,
    conferenceName: p.conferenceName,
    conferenceDate: p.conferenceDate ?? "",
    conferenceLocation: p.conferenceLocation ?? "",
    doi: p.doi ?? "",
    electronicISBN: p.electronicISBN ?? "",
    printISBN: p.printISBN ?? "",
    keywords: p.keywords ?? [],
    pdfSize: p.pdfSize ?? 0,
    hasThumbnail: !!p.thumbnailKey,
    status: p.status as Status,
    adminRemarks: p.adminRemarks ?? "",
    isFeatured: !!p.isFeatured,
    createdAt: new Date(p.createdAt).toISOString(),
    updatedAt: new Date(p.updatedAt).toISOString(),
    uploadedBy: populated ? { id: String(u!._id), name: u!.name ?? "", email: u!.email, department: u!.department } : undefined,
  };
}

export const paperYear = (p: Pick<PaperView, "conferenceDate" | "createdAt">) =>
  p.conferenceDate.match(/\b(19|20)\d{2}\b/)?.[0] ?? String(new Date(p.createdAt).getFullYear());

export type SearchParams = {
  q?: string;
  conference?: string;
  year?: string;
  author?: string;
  keyword?: string;
  featured?: boolean;
  sort?: "newest" | "oldest" | "az" | "relevant";
  page?: number;
  limit?: number;
};

const clip = (s: string | undefined, n = 200) => (s ?? "").trim().slice(0, n);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

/** Public catalog search (approved only, FR-DISC-02..06). */
export async function searchPapers(params: SearchParams) {
  await connectDB();
  const q = clip(params.q);
  const filter: QueryFilter<PaperDoc> = { status: "approved" };

  if (q) filter.$text = { $search: q };
  // FR-DISC-04: every user-supplied regex input is escaped first.
  if (clip(params.conference)) filter.conferenceName = new RegExp(`^${escapeRegex(clip(params.conference))}$`, "i");
  if (clip(params.author)) filter.authors = new RegExp(escapeRegex(clip(params.author)), "i");
  if (clip(params.keyword)) filter.keywords = new RegExp(escapeRegex(clip(params.keyword)), "i");
  if (params.featured) filter.isFeatured = true;
  if (params.year && /^(19|20)\d{2}$/.test(params.year)) {
    const y = Number(params.year);
    filter.$and = [{
      $or: [
        { conferenceDate: new RegExp(`\\b${y}\\b`) },
        { conferenceDate: "", createdAt: { $gte: new Date(Date.UTC(y, 0, 1)), $lt: new Date(Date.UTC(y + 1, 0, 1)) } },
      ],
    }];
  }

  const page = clamp(params.page ?? 1, 1, 10_000);
  const limit = clamp(params.limit ?? 10, 1, 50);
  const useScore = !!q && params.sort === "relevant";
  const sort: Record<string, 1 | -1 | { $meta: "textScore" }> =
    params.sort === "oldest" ? { createdAt: 1 }
    : params.sort === "az" ? { title: 1 }
    : useScore ? { score: { $meta: "textScore" } }
    : { createdAt: -1 };

  const query = Paper.find(filter, useScore ? { score: { $meta: "textScore" } } : undefined)
    .sort(sort as never)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const [docs, total] = await Promise.all([query, Paper.countDocuments(filter)]);
  return {
    papers: docs.map((d) => toView(d as never)),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getApprovedPaper(id: string) {
  await connectDB();
  const doc = await Paper.findOne({ _id: id, status: "approved" }).populate("uploadedBy", "name department").lean();
  return doc ? toView(doc as never) : null;
}

/** Up to 5 approved papers ranked by keyword overlap, then same conference. */
export async function getRelated(paper: PaperView) {
  await connectDB();
  const kw = paper.keywords.map((k) => k.toLowerCase());
  const candidates = await Paper.find({
    status: "approved",
    _id: { $ne: paper.id },
    $or: [{ conferenceName: paper.conferenceName }, ...(kw.length ? [{ keywords: { $in: paper.keywords.map((k) => new RegExp(`^${escapeRegex(k)}$`, "i")) } }] : [])],
  }).limit(50).lean();

  return candidates
    .map((c) => {
      const overlap = (c.keywords ?? []).filter((k) => kw.includes(k.toLowerCase())).length;
      return { c, score: overlap * 2 + (c.conferenceName === paper.conferenceName ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ c }) => toView(c as never));
}

export async function getFilterMeta() {
  await connectDB();
  const [conferences, dates, created] = await Promise.all([
    Paper.distinct("conferenceName", { status: "approved" }),
    Paper.distinct("conferenceDate", { status: "approved" }),
    Paper.find({ status: "approved", conferenceDate: "" }, { createdAt: 1 }).lean(),
  ]);
  const years = new Set<string>();
  for (const d of dates as string[]) { const m = d.match(/\b(19|20)\d{2}\b/); if (m) years.add(m[0]); }
  for (const c of created) years.add(String(new Date(c.createdAt as Date).getFullYear()));
  return { conferences: (conferences as string[]).sort(), years: [...years].sort().reverse() };
}

export async function getFeatured(limit = 6) {
  await connectDB();
  const docs = await Paper.find({ status: "approved", isFeatured: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((d) => toView(d as never));
}

export async function getPublicStats() {
  await connectDB();
  const [papers, conferences] = await Promise.all([
    Paper.countDocuments({ status: "approved" }),
    Paper.distinct("conferenceName", { status: "approved" }),
  ]);
  return { papers, conferences: conferences.length };
}
