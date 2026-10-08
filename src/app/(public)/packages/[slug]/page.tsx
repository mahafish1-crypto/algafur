import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import PackageDetailClient from "./PackageDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  try {
    const pkg = await prisma.package.findUnique({
      where: { slug: resolvedParams.slug },
    });

    if (!pkg) return { title: "Package Not Found" };

    return {
      title: `${pkg.name} | Al-Gafur International Tours And Travels`,
      description: pkg.overview || "Premium Umrah package with scholarly guidance, direct flights and walking distance hotels.",
      openGraph: {
        title: pkg.name,
        description: pkg.overview || "Al-Gafur Tours",
        images: [pkg.featuredImage || "/brand/poster.jpg"],
      },
    };
  } catch {
    return { title: "Hajj & Umrah Packages | Al-Gafur Tours" };
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  let pkg = null;
  try {
    pkg = await prisma.package.findUnique({
      where: { slug: resolvedParams.slug },
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
  } catch (err) {
    console.error("Failed to query package detail:", err);
  }

  if (!pkg) {
    notFound();
  }

  // Related packages
  let relatedPackages: any[] = [];
  try {
    relatedPackages = await prisma.package.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: pkg.id },
      },
      take: 3,
    });
  } catch (err) {
    console.error("Failed to query related packages:", err);
  }

  const settings = await getSiteSettings();

  return <PackageDetailClient pkg={pkg} relatedPackages={relatedPackages} settings={settings} />;
}

