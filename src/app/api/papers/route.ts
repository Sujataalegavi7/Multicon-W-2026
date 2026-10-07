import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { newKey, putFile, removeFiles } from "@/lib/minio";
import { searchPapers, toView, SearchParams } from "@/lib/papers";
import { parseMeta, readPdf, readThumbnail } from "@/lib/uploads";
import { Paper } from "@/models/Paper";
import { audit } from "@/models/Log";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;
  const sort = sp.get("sort") as SearchParams["sort"];
  const result = await searchPapers({
    q: sp.get("q") ?? undefined,
    conference: sp.get("conference") ?? undefined,
    year: sp.get("year") ?? undefined,
    author: sp.get("author") ?? undefined,
    keyword: sp.get("keyword") ?? undefined,
    featured: sp.get("featured") === "true",
    sort: sort && ["newest", "oldest", "az", "relevant"].includes(sort) ? sort : "newest",
    page: Number(sp.get("page") ?? 1),
    limit: Number(sp.get("limit") ?? 10),
  });
  return json(result);
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireUser();
  const form = await req.formData();
  const meta = parseMeta(form);
  const pdf = await readPdf(form);
  if (!pdf) throw new HttpError(400, "A PDF file is required");
  const thumb = await readThumbnail(form);

  const pdfKey = newKey("pdfs", pdf.ext);
  const thumbnailKey = thumb ? newKey("thumbs", thumb.ext) : null;
  await putFile(pdfKey, pdf.buffer, pdf.contentType);
  if (thumb && thumbnailKey) await putFile(thumbnailKey, thumb.buffer, thumb.contentType);

  await connectDB();
  try {
    const doc = await Paper.create({
      ...meta,
      pdfKey,
      pdfSize: pdf.buffer.length,
      thumbnailKey,
      thumbnailType: thumb?.contentType ?? null,
      uploadedBy: user.id,
      status: "pending",
    });
    await audit(user.id, `Submitted paper "${meta.title}"`, doc._id);
    return json({ paper: toView(doc.toObject() as never) }, 201);
  } catch (err) {
    await removeFiles(pdfKey, thumbnailKey); // don't orphan objects if the DB write fails
    throw err;
  }
});
