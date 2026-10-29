import { notFound, redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import {
  getPublishedPackageBySlug,
  getRelatedPublishedPackages,
  LEGACY_PACKAGE_SLUGS,
} from "@/lib/packages-data";
import { getSpiritualGuidesForPackage } from "@/lib/team-data";
import PackageDetailClient from "./PackageDetailClient";

import { buildCanonicalUrl } from "@/lib/site-url";

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

    const canonicalPath = `/packages/${pkg.slug}`;
    return {
      title: pkg.name,
      description:
        pkg.overview ||
        "Premium Umrah package with scholarly guidance, direct flights and walking distance hotels.",
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: pkg.name,
        description: pkg.overview || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
        url: buildCanonicalUrl(canonicalPath),
        images: [pkg.featuredImage || "/brand/poster.jpg"],
      },
    };
  } catch {
    return { title: "Hajj & Umrah Packages" };
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  if (resolvedParams.slug && LEGACY_PACKAGE_SLUGS[resolvedParams.slug]) {
    redirect(`/packages/${LEGACY_PACKAGE_SLUGS[resolvedParams.slug]}`);
  }

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

  const spiritualGuides = await getSpiritualGuidesForPackage(pkg.id).catch(
    () => []
  );

  return (
    <PackageDetailClient
      pkg={pkg}
      relatedPackages={relatedPackages}
      settings={settings}
      spiritualGuides={spiritualGuides}
    />
  );
}

