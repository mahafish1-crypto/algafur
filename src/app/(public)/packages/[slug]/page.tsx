import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import PackageDetailClient from "./PackageDetailClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
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
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const pkg = await prisma.package.findUnique({
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

  if (!pkg) {
    notFound();
  }

  // Related packages
  const relatedPackages = await prisma.package.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: pkg.id },
    },
    take: 3,
  });

  return <PackageDetailClient pkg={pkg} relatedPackages={relatedPackages} />;
}

