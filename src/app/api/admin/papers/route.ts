import { NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { escapeRegex, handle, json } from "@/lib/http";
import { toView } from "@/lib/papers";
import { Paper, PaperDoc, STATUSES, Status } from "@/models/Paper";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: NextRequest) => {
  await requireUser("admin");
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 200);
  const status = sp.get("status");
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20) || 20));

  const filter: QueryFilter<PaperDoc> = {};
  if (status && (STATUSES as readonly string[]).includes(status)) filter.status = status as Status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: rx }, { authors: rx }, { conferenceName: rx }, { keywords: rx }];
  }
  await connectDB();
  const [docs, total] = await Promise.all([
    Paper.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("uploadedBy", "name email department").lean(),
    Paper.countDocuments(filter),
  ]);
  return json({ papers: docs.map((d) => toView(d as never)), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
