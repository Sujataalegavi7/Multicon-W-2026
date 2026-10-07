import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Paper } from "@/models/Paper";

export const dynamic = "force-dynamic";
const base = () => (process.env.APP_URL ?? "http://localhost").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const papers = await Paper.find({ status: "approved" }, { updatedAt: 1 }).sort({ updatedAt: -1 }).lean();
  return [
    { url: `${base()}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base()}/search`, changeFrequency: "daily", priority: 0.9 },
    ...papers.map((p) => ({
      url: `${base()}/papers/${p._id}`,
      lastModified: p.updatedAt as unknown as Date,
      priority: 0.8,
    })),
  ];
}
