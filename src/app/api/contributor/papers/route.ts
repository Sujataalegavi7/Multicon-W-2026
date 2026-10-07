import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { toView } from "@/lib/papers";
import { Paper } from "@/models/Paper";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireUser();
  await connectDB();
  const docs = await Paper.find({ uploadedBy: user.id }).sort({ createdAt: -1 }).lean();
  return json({ papers: docs.map((d) => toView(d as never)) });
});
