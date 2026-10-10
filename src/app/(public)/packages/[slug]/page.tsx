import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import {
  getPublishedPackageBySlug,
  getRelatedPublishedPackages,
} from "@/lib/packages-data";
import PackageDetailClient from "./PackageDetailClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  try {
    const pkg = await getPublishedPackageBySlug(resolvedParams.slug);

    if (!pkg) return { title: "Package Not Found" };

    return {
      title: `${pkg.name} | Al-Gafur International Tours And Travels`,
      description:
        pkg.overview ||
        "Premium Umrah package with scholarly guidance, direct flights and walking distance hotels.",
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

  const [pkg, relatedPackages, settings] = await Promise.all([
    getPublishedPackageBySlug(resolvedParams.slug).catch((err) => {
      console.error("Failed to query package detail:", err);
      return null;
    }),
    getRelatedPublishedPackages(resolvedParams.slug).catch((err) => {
      console.error("Failed to query related packages:", err);
      return [];
    }),
    getSiteSettings(),
  ]);

  if (!pkg) {
    notFound();
  }

  return (
    <PackageDetailClient
      pkg={pkg}
      relatedPackages={relatedPackages}
      settings={settings}
    />
  );
}

