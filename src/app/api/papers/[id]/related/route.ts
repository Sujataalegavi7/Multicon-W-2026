import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { HttpError, handle, json } from "@/lib/http";
import { getApprovedPaper, getRelated } from "@/lib/papers";

export const dynamic = "force-dynamic";

export const GET = handle(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Paper not found");
  const paper = await getApprovedPaper(id);
  if (!paper) throw new HttpError(404, "Paper not found");
  return json({ papers: await getRelated(paper) });
});
