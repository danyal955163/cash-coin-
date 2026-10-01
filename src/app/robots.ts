import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots { const baseUrl = "https://cash-coin-peach.vercel.app"; return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/dashboard", "/wallet", "/withdrawal", "/tasks", "/free-tasks", "/deposit", "/profile", "/help", "/referral"] }], sitemap: `${baseUrl}/sitemap.xml` }; }
