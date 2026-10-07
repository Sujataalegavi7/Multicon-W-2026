import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { toView } from "@/lib/papers";
import { Paper } from "@/models/Paper";
import { audit } from "@/models/Log";

export const PATCH = handle(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("admin");
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Paper not found");
  await connectDB();
  const paper = await Paper.findById(id).populate("uploadedBy", "name email department");
  if (!paper) throw new HttpError(404, "Paper not found");
  if (!paper.isFeatured && paper.status !== "approved") throw new HttpError(400, "Only approved papers can be featured");
  paper.isFeatured = !paper.isFeatured;
  await paper.save();
  await audit(admin.id, `${paper.isFeatured ? "Featured" : "Unfeatured"} paper "${paper.title}"`, paper._id);
  return json({ paper: toView(paper.toObject() as never) });
});
