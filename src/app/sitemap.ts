import type { MetadataRoute } from "next";
import prisma from "@/lib/db";
import { CANONICAL_SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/packages", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/umrah", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/hajj", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/ramadan-umrah", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/hotels", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/booking", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/youtube-lead", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/track-booking", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/cancellation-policy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/user-agreement", priority: 0.4, changeFrequency: "yearly" as const },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((item) => ({
    url: `${CANONICAL_SITE_URL}${item.path === "/" ? "" : item.path}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  try {
    const publishedPackages = await prisma.package.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const pkg of publishedPackages) {
      if (pkg.slug) {
        entries.push({
          url: `${CANONICAL_SITE_URL}/packages/${pkg.slug}`,
          lastModified: pkg.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.85,
        });
      }
    }
  } catch (err) {
    console.error("Sitemap package lookup warning:", err);
  }

  return entries;
}

