import { cache } from "react";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";

export const PACKAGES_CACHE_TAG = "packages";
export const HOTELS_CACHE_TAG = "hotels";

export const LEGACY_PACKAGE_SLUGS: Record<string, string> = {
  u: "umrah-standard-package-15-days",
  "u-6338": "umrah-super-deluxe-package-15-days",
};

/**
 * Trigger instant cache purge across all public and admin routes whenever
 * a package is created, updated, archived, or deleted.
 */
export function revalidatePackagesCache(slugs: (string | null | undefined)[] = []) {
  try {
    revalidateTag(PACKAGES_CACHE_TAG);
  } catch (err) {
    console.warn("revalidateTag warning:", err);
  }

  const targetPages = [
    "/",
    "/packages",
    "/umrah",
    "/ramadan-umrah",
    "/hajj",
    "/booking",
    "/admin/packages",
  ];

  for (const pagePath of targetPages) {
    try {
      revalidatePath(pagePath, "page");
    } catch {}
    try {
      revalidatePath(pagePath);
    } catch {}
  }

  for (const slug of slugs) {
    if (slug) {
      const detailPath = `/packages/${slug}`;
      try {
        revalidatePath(detailPath, "page");
      } catch {}
      try {
        revalidatePath(detailPath);
      } catch {}
    }
  }

  // Flush root layout to ensure no nested static layout holds stale data
  try {
    revalidatePath("/", "layout");
  } catch {}
}

/**
 * Fetches all published packages for the public catalog and homepage.
 * Uses React request cache to deduplicate within a single request while ensuring
 * instant real-time freshness across requests.
 *
 * Automatically sorted by nearest upcoming departure date so pilgrims immediately
 * see the closest available tours first.
 */
export const getPublishedPackagesCatalog = cache(async () => {
  const pkgs = await prisma.package.findMany({
    where: { status: "PUBLISHED" },
    include: {
      inclusions: true,
      makkahHotel: true,
      madinahHotel: true,
      departureGroups: true,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const now = Date.now();
  return [...pkgs].sort((a, b) => {
    const timeA = getPackageDepartureTimestamp(a);
    const timeB = getPackageDepartureTimestamp(b);

    const isUpcomingA = timeA !== null && timeA >= now;
    const isUpcomingB = timeB !== null && timeB >= now;

    // Both upcoming: nearest to now comes first (earliest departure)
    if (isUpcomingA && isUpcomingB) {
      return (timeA as number) - (timeB as number);
    }
    // Upcoming beats past or recurring
    if (isUpcomingA && !isUpcomingB) return -1;
    if (!isUpcomingA && isUpcomingB) return 1;

    // Between recurring packages: prioritize featured
    if (a.isFeatured !== b.isFeatured) {
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }

    // Fallback to creation date descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

/**
 * Fetches single package detail by slug.
 */
export const getPublishedPackageBySlug = cache(async (slug: string) => {
  const canonicalSlug = LEGACY_PACKAGE_SLUGS[slug] || slug;
  const pkg = await prisma.package.findUnique({
    where: { slug: canonicalSlug },
    include: {
      inclusions: true,
      itineraries: {
        orderBy: { dayNumber: "asc" },
      },
      makkahHotel: true,
      madinahHotel: true,
      departureGroups: {
        where: { status: "OPEN" },
        take: 1,
      },
    },
  });
  if (!pkg || pkg.status !== "PUBLISHED") {
    return null;
  }
  return pkg;
});

/**
 * Fetches related published packages excluding current slug.
 */
export const getRelatedPublishedPackages = cache(async (excludeSlug: string) => {
  return prisma.package.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: excludeSlug },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 3,
  });
});

/**
 * Fetches published packages for booking dropdowns.
 */
export const getPublishedPackagesForBooking = cache(async () => {
  return prisma.package.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      name: true,
      durationDays: true,
      basePrice: true,
      priceQuad: true,
      priceTriple: true,
      priceDouble: true,
      departureDate: true,
      departureCity: true,
      hasSpecificDates: true,
      departureCycle: true,
      startDate: true,
      endDate: true,
      totalSeats: true,
      bookedSeats: true,
    },
    orderBy: { createdAt: "desc" },
  });
});

/**
 * Public hotels list
 */
export const getPublishedHotels = cache(async () => {
  return prisma.hotel.findMany({
    where: { isAvailable: true },
    orderBy: { starRating: "desc" },
  });
});

/**
 * Public approved testimonials
 */
export const getPublishedTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
});

/**
 * Public published FAQs
 */
export const getPublishedFaqs = cache(async () => {
  return prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
});

/**
 * Public blog posts
 */
export const getPublishedBlogPosts = cache(async () => {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
});

/**
 * Public blog post by slug
 */
export const getPublishedBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug },
  });
});

import {
  getPackageDepartureTimestamp,
  parseDateString,
} from "./package-dates";

export { getPackageDepartureTimestamp, parseDateString };

/**
 * Resolves the primary featured/spotlight package for Homepage Hero and Spotlight section:
 * 1. Site Settings explicit pin (hero_featured_package_slug) if set, valid, and upcoming/active.
 * 2. Active packages pinned as isFeatured === true, sorted by departure date closest to today (nearest upcoming).
 * 3. Fallback: all active published packages sorted by departure date closest to today (nearest upcoming).
 * 4. Fallback: first published package or null.
 */
export function resolveSpotlightPackage<
  T extends {
    id?: string;
    slug: string;
    status?: string;
    isFeatured?: boolean;
    startDate?: Date | string | null;
    departureDate?: string | null;
    departureGroups?: Array<{ departureDate?: string | null; startDate?: Date | string | null }> | null;
  }
>(
  allPackages: T[],
  settings?: Record<string, string>
): T | null {
  if (!allPackages || allPackages.length === 0) return null;

  const published = allPackages.filter((p) => !p.status || p.status === "PUBLISHED");
  if (published.length === 0) return allPackages[0] || null;

  const now = Date.now();

  // 1. Site settings explicit pin (ensure not a stale past date)
  const pinnedSlug = settings?.hero_featured_package_slug?.trim();
  if (pinnedSlug && !pinnedSlug.includes("ramadan-blessed-last-15-days")) {
    const pinned = published.find((p) => p.slug === pinnedSlug);
    if (pinned) {
      const pinnedTime = getPackageDepartureTimestamp(pinned);
      if (pinnedTime === null || pinnedTime >= now) {
        return pinned;
      }
    }
  }

  const sortNearestUpcoming = (list: T[]): T[] => {
    return [...list].sort((a, b) => {
      const timeA = getPackageDepartureTimestamp(a);
      const timeB = getPackageDepartureTimestamp(b);

      const isUpcomingA = timeA !== null && timeA >= now;
      const isUpcomingB = timeB !== null && timeB >= now;

      // Both upcoming: nearest to now comes first (earliest departure)
      if (isUpcomingA && isUpcomingB) {
        return (timeA as number) - (timeB as number);
      }
      // Upcoming beats past or date-less
      if (isUpcomingA && !isUpcomingB) return -1;
      if (!isUpcomingA && isUpcomingB) return 1;

      // If both have timestamps, order closest to now
      if (timeA !== null && timeB !== null) {
        return Math.abs(timeA - now) - Math.abs(timeB - now);
      }
      if (timeA !== null) return -1;
      if (timeB !== null) return 1;
      return 0;
    });
  };

  // 2. Filter packages with isFeatured === true (prioritize nearest upcoming among them)
  const featured = published.filter((p) => Boolean(p.isFeatured));
  if (featured.length > 0) {
    const sortedFeatured = sortNearestUpcoming(featured);
    return sortedFeatured[0];
  }

  // 3. Fallback: all published packages sorted by nearest upcoming departure
  const sortedAll = sortNearestUpcoming(published);
  return sortedAll[0] || published[0] || null;
}

export { parseZiyaratLandmarks } from "./ziyarat-helpers";
