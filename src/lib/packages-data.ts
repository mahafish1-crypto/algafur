import { cache } from "react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";

export const PACKAGES_CACHE_TAG = "packages";

const fetchPublishedPackagesCatalog = unstable_cache(
  async () => {
    return prisma.package.findMany({
      where: { status: "PUBLISHED" },
      include: {
        inclusions: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  },
  ["public-packages-catalog"],
  {
    revalidate: 60,
    tags: [PACKAGES_CACHE_TAG],
  }
);

export const getPublishedPackagesCatalog = cache(async () => {
  return fetchPublishedPackagesCatalog();
});

const fetchPublishedPackageBySlug = unstable_cache(
  async (slug: string) => {
    const pkg = await prisma.package.findUnique({
      where: { slug },
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
  },
  ["public-package-detail-by-slug"],
  {
    revalidate: 60,
    tags: [PACKAGES_CACHE_TAG],
  }
);

export const getPublishedPackageBySlug = cache(async (slug: string) => {
  return fetchPublishedPackageBySlug(slug);
});

const fetchRelatedPublishedPackages = unstable_cache(
  async (excludeSlug: string) => {
    return prisma.package.findMany({
      where: {
        status: "PUBLISHED",
        slug: { not: excludeSlug },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 3,
    });
  },
  ["public-related-packages"],
  {
    revalidate: 60,
    tags: [PACKAGES_CACHE_TAG],
  }
);

export const getRelatedPublishedPackages = cache(async (excludeSlug: string) => {
  return fetchRelatedPublishedPackages(excludeSlug);
});

const fetchPublishedPackagesForBooking = unstable_cache(
  async () => {
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
        totalSeats: true,
        bookedSeats: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["public-packages-for-booking"],
  {
    revalidate: 60,
    tags: [PACKAGES_CACHE_TAG],
  }
);

export const getPublishedPackagesForBooking = cache(async () => {
  return fetchPublishedPackagesForBooking();
});

