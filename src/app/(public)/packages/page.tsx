import PackagesClientView from "./PackagesClientView";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [resolvedParams, allPackages] = await Promise.all([
    searchParams,
    getPublishedPackagesCatalog().catch((err) => {
      console.error("Failed to query packages:", err);
      return [];
    }),
  ]);

  const typeFilter = typeof resolvedParams.type === "string" ? resolvedParams.type : undefined;
  const durationFilter = typeof resolvedParams.duration === "string" ? resolvedParams.duration : undefined;

  const packages = allPackages.filter((pkg) => {
    if (typeFilter && typeFilter !== "ALL" && pkg.type !== typeFilter) {
      return false;
    }
    if (durationFilter && durationFilter !== "ALL" && pkg.durationDays !== parseInt(durationFilter, 10)) {
      return false;
    }
    return true;
  });

  return <PackagesClientView initialPackages={packages} />;
}

