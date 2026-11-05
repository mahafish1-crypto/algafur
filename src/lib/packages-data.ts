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
 */
export const getPublishedPackagesCatalog = cache(async () => {
  return prisma.package.findMany({
    where: { status: "PUBLISHED" },
    include: {
      inclusions: true,
      makkahHotel: true,
      madinahHotel: true,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
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
