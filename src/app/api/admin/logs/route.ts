import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { Log } from "@/models/Log";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: NextRequest) => {
  await requireUser("admin");
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 25) || 25));
  await connectDB();
  const [docs, total] = await Promise.all([
    Log.find().sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email").populate("paper", "title").lean(),
    Log.countDocuments(),
  ]);
  type L = { _id: unknown; action: string; timestamp: Date; user?: { name?: string; email?: string }; paper?: { title?: string } };
  return json({
    logs: (docs as unknown as L[]).map((l) => ({
      id: String(l._id), action: l.action, timestamp: new Date(l.timestamp).toISOString(),
      user: l.user?.name ?? "Unknown", email: l.user?.email ?? "", paper: l.paper?.title ?? null,
    })),
    total, page, pages: Math.max(1, Math.ceil(total / limit)),
  });
});
