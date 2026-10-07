import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getSession, requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { newKey, putFile, removeFiles } from "@/lib/minio";
import { toView } from "@/lib/papers";
import { parseMeta, readPdf, readThumbnail } from "@/lib/uploads";
import { Paper, STATUSES } from "@/models/Paper";
import { audit } from "@/models/Log";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

async function findPaper(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Paper not found");
  await connectDB();
  const paper = await Paper.findById(id);
  if (!paper) throw new HttpError(404, "Paper not found");
  return paper;
}

export const GET = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const paper = await findPaper(id);
  if (paper.status !== "approved") {
    const s = await getSession();
    if (!s || (s.role !== "admin" && String(paper.uploadedBy) !== s.id)) throw new HttpError(404, "Paper not found");
  }
  await paper.populate("uploadedBy", "name department");
  return json({ paper: toView(paper.toObject() as never) });
});

// FR-CONTRIB-05/06/07: owners may edit unless approved; an edit resets to pending and clears remarks.
export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const paper = await findPaper(id);
  if (String(paper.uploadedBy) !== user.id) throw new HttpError(403, "You can only edit your own papers");
  if (paper.status === "approved") throw new HttpError(403, "Approved papers cannot be modified");

  const form = await req.formData();
  const meta = parseMeta(form);
  const pdf = await readPdf(form);
  const thumb = await readThumbnail(form);
  const removeThumb = form.get("removeThumbnail") === "true";

  const oldPdf = paper.pdfKey;
  const oldThumb = paper.thumbnailKey;
  const newPdfKey = pdf ? newKey("pdfs", pdf.ext) : null;
  const newThumbKey = thumb ? newKey("thumbs", thumb.ext) : null;
  if (pdf && newPdfKey) await putFile(newPdfKey, pdf.buffer, pdf.contentType);
  if (thumb && newThumbKey) await putFile(newThumbKey, thumb.buffer, thumb.contentType);

  try {
    Object.assign(paper, meta, { status: "pending", adminRemarks: "" });
    if (pdf && newPdfKey) { paper.pdfKey = newPdfKey; paper.pdfSize = pdf.buffer.length; }
    if (thumb && newThumbKey) { paper.thumbnailKey = newThumbKey; paper.thumbnailType = thumb.contentType; }
    else if (removeThumb) { paper.thumbnailKey = null; paper.thumbnailType = null; }
    await paper.save();
  } catch (err) {
    await removeFiles(newPdfKey, newThumbKey);
    throw err;
  }

  // Purge replaced files only after the DB update succeeded (FR-CONTRIB-06).
  if (newPdfKey) await removeFiles(oldPdf);
  if (newThumbKey || removeThumb) await removeFiles(oldThumb);
  await audit(user.id, `Edited and resubmitted paper "${paper.title}"`, paper._id);
  return json({ paper: toView(paper.toObject() as never) });
});

const decisionSchema = z.object({ status: z.enum(STATUSES), remarks: z.string().trim().max(5000).default("") });

// Admin moderation: approve / reject / request changes.
export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const admin = await requireUser("admin");
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Paper not found");
  const { status, remarks } = decisionSchema.parse(await req.json());
  if ((status === "rejected" || status === "changes_requested") && !remarks) {
    throw new HttpError(400, "Please include remarks explaining the decision");
  }

  await connectDB();
  const paper = await Paper.findByIdAndUpdate(
    id,
    { status, adminRemarks: remarks, ...(status !== "approved" && { isFeatured: false }) },
    { new: true }
  ).populate("uploadedBy", "name email department");
  if (!paper) throw new HttpError(404, "Paper not found");
  await audit(admin.id, `Set status of "${paper.title}" to ${status}`, paper._id);
  return json({ paper: toView(paper.toObject() as never) });
});

export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const paper = await findPaper(id);
  const isOwner = String(paper.uploadedBy) === user.id;
  if (user.role !== "admin" && !isOwner) throw new HttpError(403, "Forbidden");
  if (user.role !== "admin" && paper.status === "approved") throw new HttpError(403, "Approved papers cannot be deleted");

  await paper.deleteOne();
  await removeFiles(paper.pdfKey, paper.thumbnailKey); // FR-DOC-03
  await audit(user.id, `Deleted paper "${paper.title}"`);
  return json({ ok: true });
});
