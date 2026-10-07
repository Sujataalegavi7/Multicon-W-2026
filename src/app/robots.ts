import type { MetadataRoute } from "next";

const base = () => (process.env.APP_URL ?? "http://localhost").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/papers/", "/search", "/files/pdf/"], disallow: ["/admin", "/dashboard", "/api/"] }],
    sitemap: `${base()}/sitemap.xml`,
  };
}
