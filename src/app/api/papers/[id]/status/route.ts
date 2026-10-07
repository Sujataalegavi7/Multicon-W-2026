import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";
import { toView } from "@/lib/papers";
import { Paper, STATUSES } from "@/models/Paper";
import { audit } from "@/models/Log";

const schema = z.object({ status: z.enum(STATUSES), remarks: z.string().trim().max(5000).default("") });

export const PATCH = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("admin");
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Paper not found");
  const { status, remarks } = schema.parse(await req.json());
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
