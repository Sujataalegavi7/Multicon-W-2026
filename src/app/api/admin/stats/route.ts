import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { toView } from "@/lib/papers";
import { Paper } from "@/models/Paper";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireUser("admin");
  await connectDB();
  const [total, pending, approved, rejected, changes, contributors, recent] = await Promise.all([
    Paper.countDocuments(),
    Paper.countDocuments({ status: "pending" }),
    Paper.countDocuments({ status: "approved" }),
    Paper.countDocuments({ status: "rejected" }),
    Paper.countDocuments({ status: "changes_requested" }),
    User.countDocuments({ role: "contributor" }),
    Paper.find().sort({ createdAt: -1 }).limit(5).populate("uploadedBy", "name").lean(),
  ]);
  return json({ total, pending, approved, rejected, changesRequested: changes, contributors, recent: recent.map((d) => toView(d as never)) });
});
